/**
 * 🌌 MAIN ORCHESTRATOR & LOCAL-FIRST GAME MANAGER
 * ================================================
 * El núcleo integrador que une la lógica de IndexedDB, Supabase, Cifrado, Motor Narrativo y UI.
 * 
 * FASE 1: Arquitectura & FASE 6: Local First & FASE 7: Sincronización
 */

import { initDB, dbGet, dbPut, queuePush, queueGetPending } from './core/db.js';
import { checkConnection, authSignUp, authSignIn, syncLocalToCloud } from './core/supabase.js';
import { encryptData, decryptData } from './core/crypto.js';
import { CHARACTER_CLASSES, GODDESS_DEITIES, INITIAL_CHARACTERS } from './game/character.js';
import { ITEMS_CATALOG, addItemToInventory, useConsumableItem } from './game/inventory.js';
import { SKILLS_DATABASE, useSkill } from './game/skills.js';
import { INITIAL_NPCS, modifyRelationship } from './game/npc.js';
import { INITIAL_REGIONS, changeActiveRegion } from './game/world.js';
import { STORY_NODES } from './game/story.js';
import {
  initNavigationTabs,
  renderConnectionIndicator,
  renderStoryScreen,
  renderCharacterTab,
  renderSkillsTab,
  renderInventoryTab,
  renderNpcsTab,
  renderWorldTab
} from './ui/renderer.js';
import {
  renderWelcomeScreen,
  renderSignUpScreen,
  renderSignInScreen,
  renderCharacterCreator
} from './ui/onboarding.js';

// Estado global unificado del juego (en memoria)
let gameState = {
  player: null,          // { id, email }
  character: null,       // { name, stats, skills: [], inventory: [], completedQuests: [] }
  npcs: INITIAL_NPCS,
  regions: INITIAL_REGIONS,
  currentNodeId: 'intro-1',
  activeRegionId: 'start-village',
  password: '',          // Semilla cifrante AES-GCM del jugador
  sharedGame: null       // Coop status
};

// ═══════════════════════════════════════════════
// INICIALIZACIÓN OFFLINE-FIRST
// ═══════════════════════════════════════════════

window.addEventListener('load', async () => {
  // 1. Inicializar base de datos IndexedDB local
  await initDB();

  // 2. Suscribirse a eventos de red del navegador
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);
  
  // Analizar red inicial
  await handleNetworkChange();

  // 3. Verificar si ya existe una partida cifrada local cargada
  const activeUser = await dbGet('save_data', 'session_user');
  const encryptedSave = await dbGet('save_data', 'encrypted_save');

  if (activeUser && encryptedSave) {
    // Si ya inicializó antes: Solicitar contraseña para descifrar partida local
    showSavePasswordGate(activeUser, encryptedSave);
  } else {
    // Primer Uso: Iniciar flujo de bienvenida/registro
    showWelcomeFlow();
  }
});

// Maneja cambios de conexión física de forma asíncrona
async function handleNetworkChange() {
  const isOnline = await checkConnection();
  renderConnectionIndicator(isOnline ? 'online' : 'offline');

  if (isOnline && gameState.player) {
    // Gatillar la sincronización de la cola automáticamente
    triggerCloudSync();
  }
}

// ═══════════════════════════════════════════════
// FLUJO DE PRIMER USO (PASOS 1-10 DE LA REGLA)
// ═══════════════════════════════════════════════

function showWelcomeFlow() {
  document.getElementById('app-root').classList.add('hidden');
  document.getElementById('onboarding-root').classList.remove('hidden');
  
  renderWelcomeScreen((action) => {
    if (action === 'signin_view') {
      showSignInView();
    } else if (action === 'signup_view') {
      showSignUpView();
    }
  });
}

function showSignUpView() {
  renderSignUpScreen(async (email, password) => {
    try {
      showStatusMsg('Creando cuenta en la nube de Supabase...', 'info');
      const user = await authSignUp(email, password);
      
      gameState.player = { id: user.id, email: user.email };
      gameState.password = password;

      showStatusMsg('✓ Cuenta creada exitosamente.', 'success');
      showCharacterCreatorFlow();
    } catch (err) {
      showStatusMsg(err.message, 'error');
    }
  }, showWelcomeFlow);
}

function showSignInView() {
  renderSignInScreen(async (email, password) => {
    try {
      showStatusMsg('Iniciando sesión...', 'info');
      const user = await authSignIn(email, password);
      
      gameState.player = { id: user.id, email: user.email };
      gameState.password = password;

      showStatusMsg('✓ Inicio de sesión exitoso.', 'success');
      
      // Intentar cargar salvado anterior
      const encryptedSave = await dbGet('save_data', 'encrypted_save');
      if (encryptedSave) {
        await loadAndDecryptSave(encryptedSave, password);
      } else {
        showCharacterCreatorFlow();
      }
    } catch (err) {
      showStatusMsg(err.message, 'error');
    }
  }, showWelcomeFlow);
}

function showCharacterCreatorFlow() {
  renderCharacterCreator(async (creatorData) => {
    try {
      showStatusMsg('Guardando tu personaje en local...', 'info');

      // Estructurar el personaje inicial unificado
      const char = {
        name: creatorData.characterName,
        characterIndex: creatorData.characterIndex,
        classIndex: creatorData.classIndex,
        goddessIndex: creatorData.goddessIndex,
        primary: creatorData.stats.primary,
        secondary: creatorData.stats.secondary,
        skills: ['analyze'], // Empieza con la habilidad de analizar!
        inventory: [{ id: 'potion-hp', name: 'Poción de Vida Mayor', category: 'consumibles', heal_hp: 45, quantity: 1 }]
      };

      gameState.character = char;

      // Paso 8: Guardar en Supabase
      const isOnline = await checkConnection();
      if (isOnline) {
        // Registrar en la cola y procesar inmediatamente
        await queuePush('CREATE_CHARACTER', 'characters', {
          id: gameState.player.id,
          name: char.name,
          character_index: char.characterIndex,
          class_index: char.classIndex,
          goddess_index: char.goddessIndex,
          primary_stats: char.primary,
          secondary_stats: char.secondary,
          skills: char.skills
        });
        await triggerCloudSync();
      } else {
        // Offline: empujar a la cola para sincronizar después
        await queuePush('CREATE_CHARACTER', 'characters', {
          id: gameState.player.id,
          name: char.name,
          character_index: char.characterIndex,
          class_index: char.classIndex,
          goddess_index: char.goddessIndex,
          primary_stats: char.primary,
          secondary_stats: char.secondary,
          skills: char.skills
        });
      }

      // Paso 9: Guardar copia local cifrada con Web Crypto
      await saveGameLocal();

      showStatusMsg('✓ Personaje creado con éxito.', 'success');
      
      // Paso 10: Comenzar introducción del libro mágico
      startMainGame();

    } catch (err) {
      showStatusMsg('Error en creación: ' + err.message, 'error');
    }
  });
}

// ═══════════════════════════════════════════════
// ACCESO CIFRADO DE GUARDADO LOCAL (SAVE GATES)
// ═══════════════════════════════════════════════

function showSavePasswordGate(user, encryptedSave) {
  document.getElementById('app-root').classList.add('hidden');
  const onboarding = document.getElementById('onboarding-root');
  onboarding.classList.remove('hidden');

  onboarding.innerHTML = `
    <div class="max-w-md w-full p-6 space-y-5 animate-fadeIn font-sans">
      <div class="text-center">
        <h2 class="text-md font-black uppercase text-[#06b6d4] font-mono">Caja Fuerte de Partida</h2>
        <p class="text-[8px] text-stone-500 font-bold uppercase tracking-widest font-mono mt-1">Descifra tus datos locales (AES-GCM)</p>
      </div>
      
      <p class="text-xs text-stone-400 text-center leading-relaxed">
        Hola de nuevo, <span class="font-black text-white">${user.email}</span>. Para proteger tus decisiones y progreso, ingresa la contraseña para descifrar tu pergamino local.
      </p>

      <form id="save-decrypt-form" class="space-y-4 pt-2">
        <div class="space-y-1">
          <input type="password" id="save-password" required placeholder="Contraseña de la partida" class="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-900 text-xs font-bold text-white focus:outline-none" />
        </div>
        <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-black uppercase tracking-wider">
          Desbloquear Pergamino
        </button>
      </form>
    </div>
  `;

  document.getElementById('save-decrypt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = document.getElementById('save-password').value;
    try {
      showStatusMsg('Descifrando partida mística...', 'info');
      await loadAndDecryptSave(encryptedSave, pass);
      gameState.password = pass;
      gameState.player = user;
      
      showStatusMsg('✓ Partida descifrada correctamente.', 'success');
      startMainGame();
    } catch (err) {
      showStatusMsg('Contraseña incorrecta o corrupta.', 'error');
    }
  });
}

async function loadAndDecryptSave(encryptedBytes, password) {
  const decrypted = await decryptData(encryptedBytes, password);
  gameState.character = decrypted.character;
  gameState.npcs = decrypted.npcs || INITIAL_NPCS;
  gameState.regions = decrypted.regions || INITIAL_REGIONS;
  gameState.currentNodeId = decrypted.currentNodeId || 'intro-1';
  gameState.activeRegionId = decrypted.activeRegionId || 'start-village';
}

// ═══════════════════════════════════════════════
// SISTEMA DE GUARDADO AUTÓNOMO (AUTO SAVE)
// ═══════════════════════════════════════════════

export async function saveGameLocal() {
  if (!gameState.character || !gameState.password) return;

  const savePayload = {
    character: gameState.character,
    npcs: gameState.npcs,
    regions: gameState.regions,
    currentNodeId: gameState.currentNodeId,
    activeRegionId: gameState.activeRegionId
  };

  // Cifrar localmente usando AES-GCM
  const encryptedBase64 = await encryptData(savePayload, gameState.password);
  await dbPut('save_data', 'encrypted_save', encryptedBase64);
  console.log('✓ Guardado local auto-salvado y cifrado con éxito.');
}

// ═══════════════════════════════════════════════
// PROCESAMIENTO DE HISTORIA & DECISIONES
// ═══════════════════════════════════════════════

function startMainGame() {
  document.getElementById('onboarding-root').classList.add('hidden');
  document.getElementById('app-root').classList.remove('hidden');

  // Inicializar navegación del menú inferior
  initNavigationTabs(gameState, handleTabChange);

  // Renderizar escena inicial
  renderActiveStoryNode();
}

function handleTabChange(tabId) {
  if (tabId === 'story') {
    renderActiveStoryNode();
    document.getElementById('story-page-layout').classList.remove('hidden');
    document.getElementById('tab-content-container').classList.add('hidden');
  } else {
    document.getElementById('story-page-layout').classList.add('hidden');
    const tabContainer = document.getElementById('tab-content-container');
    tabContainer.classList.remove('hidden');

    if (tabId === 'character') {
      renderCharacterTab(gameState.character);
    } else if (tabId === 'skills') {
      renderSkillsTab(gameState.character, handleLearnSkill);
    } else if (tabId === 'inventory') {
      renderInventoryTab(gameState.character.inventory, handleUseItem);
    } else if (tabId === 'relationships') {
      renderNpcsTab(gameState.npcs);
    } else if (tabId === 'world') {
      renderWorldTab(gameState.regions, handleTravel);
    }
  }
}

function renderActiveStoryNode() {
  renderStoryScreen(
    gameState.currentNodeId,
    gameState.character,
    gameState.character.inventory,
    handleSelectNarrativeChoice
  );
}

// Procesa una decisión narrativa tomada por el jugador
async function handleSelectNarrativeChoice(choice) {
  playBeep(520, 0.08);
  
  const node = STORY_NODES[gameState.currentNodeId];
  const targetNodeId = choice.nextNode;
  
  // Guardar decisión mística en cola
  await queuePush('MAKE_DECISION', 'story_choices', {
    id: 'dec-' + Math.random().toString(36).substr(2, 9),
    player_id: gameState.player.id,
    node_id: gameState.currentNodeId,
    choice_text: choice.text,
    next_node_id: targetNodeId
  });

  // Procesar recompensas de la decisión si existen en el nodo
  const targetNode = STORY_NODES[targetNodeId];
  if (targetNode && targetNode.rewards) {
    const rewards = targetNode.rewards;
    
    // Items
    if (rewards.items) {
      rewards.items.forEach(itemId => {
        gameState.character.inventory = addItemToInventory(gameState.character.inventory, itemId);
        queuePush('ADD_ITEM', 'inventory', { id: 'inv-' + Math.random().toString(36).substr(2, 9), player_id: gameState.player.id, item_id: itemId });
      });
    }

    // Cambios de relación con NPCs
    if (rewards.relations) {
      Object.entries(rewards.relations).forEach(([npcId, data]) => {
        const npc = gameState.npcs.find(n => n.id === npcId);
        if (npc) {
          const res = modifyRelationship(npc, data.field, data.val);
          if (res.message) showStatusMsg(res.message, 'info');
          queuePush('UPDATE_RELATIONSHIP', 'relationships', { id: 'rel-' + Math.random().toString(36).substr(2, 9), player_id: gameState.player.id, npc_id: npcId, field_modified: data.field, new_value: npc[data.field] });
        }
      });
    }

    // Daño recibido
    if (targetNode.damage) {
      gameState.character.secondary.hp = Math.max(0, gameState.character.secondary.hp - targetNode.damage);
      if (gameState.character.secondary.hp === 0) {
        showStatusMsg('⚠️ Te has desmayado por daño espiritual. Eirene te cura.', 'error');
        gameState.character.secondary.hp = 30; // Resucita con poca vida
      }
    }
  }

  // Avanzar historia
  gameState.currentNodeId = targetNodeId;

  // Auto-guardado persistente local
  await saveGameLocal();
  
  // Re-renderizar
  renderActiveStoryNode();

  // Re-intentar sincronización con la nube
  triggerCloudSync();
}

// ═══════════════════════════════════════════════
// MANEJADORES DE MENÚ TAB (SKILLS, ITEMS, TRAVEL)
// ═══════════════════════════════════════════════

async function handleLearnSkill(skillId) {
  const skill = SKILLS_DATABASE.find(s => s.id === skillId);
  if (!skill) return;

  playBeep(440, 0.1);

  if (gameState.character.skills.includes(skillId)) return;

  gameState.character.skills.push(skillId);
  showStatusMsg(`✓ Aprendiste la habilidad: **${skill.name}**`, 'success');

  await queuePush('LEARN_SKILL', 'character_skills', { id: 'sk-' + Math.random().toString(36).substr(2, 9), player_id: gameState.player.id, skill_id: skillId });
  await saveGameLocal();
  renderSkillsTab(gameState.character, handleLearnSkill);
  triggerCloudSync();
}

async function handleUseItem(itemId) {
  const res = useConsumableItem(itemId, gameState.character);
  if (res.success) {
    playBeep(600, 0.12);
    showStatusMsg(res.message, 'success');
    gameState.character.inventory = removeItemFromInventory(gameState.character.inventory, itemId);
    
    await queuePush('REMOVE_ITEM', 'inventory', { player_id: gameState.player.id, item_id: itemId });
    await saveGameLocal();
    renderInventoryTab(gameState.character.inventory, handleUseItem);
    triggerCloudSync();
  } else {
    showStatusMsg(res.reason, 'error');
  }
}

async function handleTravel(regionId) {
  const res = changeActiveRegion(regionId, gameState.regions);
  if (res.success) {
    playBeep(700, 0.1);
    showStatusMsg(res.message, 'success');
    gameState.activeRegionId = res.activeRegionId;

    await queuePush('UPDATE_WORLD', 'world_states', { player_id: gameState.player.id, active_region_id: regionId });
    await saveGameLocal();
    renderWorldTab(gameState.regions, handleTravel);
    triggerCloudSync();
  } else {
    showStatusMsg(res.reason, 'error');
  }
}

// ═══════════════════════════════════════════════
// CLOUD SYNC EXECUTOR (IDEMPOTENTE)
// ═══════════════════════════════════════════════

let isSyncInProgress = false;

export async function triggerCloudSync() {
  if (isSyncInProgress) return;
  
  const isOnline = await checkConnection();
  if (!isOnline) {
    renderConnectionIndicator('offline');
    return;
  }

  const pending = await queueGetPending();
  if (pending.length === 0) {
    renderConnectionIndicator('online');
    return;
  }

  isSyncInProgress = true;
  renderConnectionIndicator('syncing');

  try {
    const successCount = await syncLocalToCloud(pending, (msg) => {
      console.log('Sincronizador:', msg);
    });

    if (successCount > 0) {
      showStatusMsg(`✓ Sincronizado: ${successCount} cambios enviados a Supabase.`, 'success');
    }
    renderConnectionIndicator('online');
  } catch (err) {
    console.warn('Sincronización falló de forma silente:', err);
    renderConnectionIndicator('offline');
  } finally {
    isSyncInProgress = false;
  }
}

// Muestra mensajes de estado / notificaciones elegantes en el pergamino
function showStatusMsg(text, type = 'info') {
  const container = document.getElementById('notification-log');
  if (!container) return;

  const msg = document.createElement('div');
  msg.className = `p-3 rounded-xl text-[10px] font-bold uppercase border tracking-wider shadow-sm animate-fadeIn flex justify-between items-center ${
    type === 'success' ? 'bg-emerald-950/20 text-emerald-500 border-emerald-900/30' :
    type === 'error' ? 'bg-rose-950/20 text-rose-400 border-rose-900/30' :
    'bg-stone-900 text-stone-300 border-stone-800'
  }`;

  msg.innerHTML = `<span>${text}</span> <button class="p-0.5 ml-2 hover:text-white" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(msg);

  // Auto remove in 6 seconds
  setTimeout(() => {
    msg.classList.add('opacity-0', 'transition-opacity');
    setTimeout(() => msg.remove(), 400);
  }, 6000);
}

// Exponer manejador global para el click de info del indicador de conexión
document.getElementById('connection-badge')?.addEventListener('click', () => {
  const badge = document.getElementById('connection-badge');
  const status = badge.dataset.status;
  if (status === 'offline') {
    showStatusMsg('Modo Offline: Tus cambios se guardarán de forma segura y cifrada en el dispositivo, y se subirán a Supabase al recuperar la red.', 'info');
  } else {
    showStatusMsg('✓ Conexión en línea: Tus partidas están sincronizadas de manera segura con tu cuenta de Supabase en la nube.', 'success');
  }
});
