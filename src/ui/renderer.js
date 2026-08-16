/**
 * 🖌️ IMMERSIVE DOM RENDERING & UX PANEL CONTROLLER
 * ================================================
 * Controla las transiciones del libro mágico, pergaminos de estadísticas y renderizado de cartas.
 * 
 * FASE 16: Pulido visual
 */

import { STORY_NODES, evaluateChoiceRequirements } from '../game/story.js';
import { ITEMS_CATALOG } from '../game/inventory.js';
import { SKILLS_DATABASE } from '../game/skills.js';
import { INITIAL_NPCS } from '../game/npc.js';
import { INITIAL_REGIONS } from '../game/world.js';

let appState = null; // El estado de juego global inyectado por el main
let activeTab = 'story'; // Pestaña de menú activa

// Inicializa las pestañas de navegación del menú inferior
export function initNavigationTabs(state, onTabChange) {
  appState = state;
  const navTabs = document.querySelectorAll('.nav-tab');
  
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      activeTab = tabId;
      
      // Remover activas
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (onTabChange) onTabChange(tabId);
    });
  });
}

// Actualiza el indicador permanente discreto de conexión en el UI
export function renderConnectionIndicator(status) {
  const badge = document.getElementById('connection-badge');
  if (!badge) return;

  badge.className = 'connection-badge shadow-sm transition-all';
  
  if (status === 'online') {
    badge.innerHTML = '<span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-1"></span> 🟢 Online';
    badge.dataset.status = 'online';
  } else if (status === 'syncing') {
    badge.innerHTML = '<span class="w-2 h-2 bg-amber-500 rounded-full animate-spin mr-1"></span> 🟠 Sincronizando';
    badge.dataset.status = 'syncing';
  } else {
    badge.innerHTML = '<span class="w-2 h-2 bg-rose-500 rounded-full mr-1"></span> 🔴 Offline';
    badge.dataset.status = 'offline';
  }
}

// Renderiza la pantalla principal narrativa del Libro de Hechizos
export function renderStoryScreen(nodeId, charStats, inventory, onSelectChoice) {
  const node = STORY_NODES[nodeId];
  if (!node) return;

  const titleEl = document.getElementById('story-title');
  const textEl = document.getElementById('story-text');
  const choicesEl = document.getElementById('story-choices');
  const chapterEl = document.getElementById('story-chapter');

  if (chapterEl) chapterEl.innerText = node.chapter;
  if (titleEl) titleEl.innerText = node.title;
  if (textEl) textEl.innerText = node.text;

  if (choicesEl) {
    choicesEl.innerHTML = '';
    
    node.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase text-left transition-all border shadow-sm ';
      
      // Evaluar si cumple requisitos de atributos/objetos/habilidades
      const check = evaluateChoiceRequirements(choice, charStats, inventory);
      
      if (check.valid) {
        btn.classList.add('bg-stone-900', 'border-stone-800', 'text-white', 'hover:border-purple-500', 'active:scale-[0.98]');
        btn.innerHTML = `<span class="text-[#06b6d4] mr-2">✦</span> ${choice.text}`;
        btn.addEventListener('click', () => onSelectChoice(choice));
      } else {
        // Opción deshabilitada/grisada
        btn.classList.add('bg-stone-950/50', 'border-stone-950', 'text-stone-500', 'cursor-not-allowed', 'opacity-50');
        btn.innerHTML = `<span class="text-stone-600 mr-2">🔒</span> ${choice.text} <span class="block text-[8px] text-red-500 font-bold mt-1 uppercase">${check.reason}</span>`;
      }

      choicesEl.appendChild(btn);
    });
  }
}

// Renderiza la pestaña del personaje (Pergamino de Atributos)
export function renderCharacterTab(charStats) {
  const container = document.getElementById('tab-content-container');
  if (!container) return;

  const pri = charStats.primary;
  const sec = charStats.secondary;

  container.innerHTML = `
    <div class="space-y-5 animate-fadeIn">
      <div class="parchment-panel p-5 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 font-mono flex items-center gap-1">
          🛡️ Estadísticas Principales
        </h3>
        
        <div class="grid grid-cols-2 gap-3.5">
          <div class="stat-card p-3 rounded-xl bg-stone-950/80 border border-stone-900">
            <p class="text-[9px] text-stone-500 font-bold uppercase">Fuerza (STR)</p>
            <p class="text-base font-black font-mono mt-1 text-white">${pri.str}</p>
          </div>
          <div class="stat-card p-3 rounded-xl bg-stone-950/80 border border-stone-900">
            <p class="text-[9px] text-stone-500 font-bold uppercase">Inteligencia (INT)</p>
            <p class="text-base font-black font-mono mt-1 text-white">${pri.int}</p>
          </div>
          <div class="stat-card p-3 rounded-xl bg-stone-950/80 border border-stone-900">
            <p class="text-[9px] text-stone-500 font-bold uppercase">Agilidad (AGI)</p>
            <p class="text-base font-black font-mono mt-1 text-white">${pri.agi}</p>
          </div>
          <div class="stat-card p-3 rounded-xl bg-stone-950/80 border border-stone-900">
            <p class="text-[9px] text-stone-500 font-bold uppercase">Vitalidad (VIT)</p>
            <p class="text-base font-black font-mono mt-1 text-white">${pri.vit}</p>
          </div>
          <div class="stat-card p-3 rounded-xl bg-stone-950/80 border border-stone-900">
            <p class="text-[9px] text-stone-500 font-bold uppercase">Suerte (LUCK)</p>
            <p class="text-base font-black font-mono mt-1 text-white">${pri.luck}</p>
          </div>
          <div class="stat-card p-3 rounded-xl bg-stone-950/80 border border-stone-900">
            <p class="text-[9px] text-stone-500 font-bold uppercase">Voluntad (WILL)</p>
            <p class="text-base font-black font-mono mt-1 text-white">${pri.will}</p>
          </div>
        </div>
      </div>

      <div class="parchment-panel p-5 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#06b6d4] font-mono flex items-center gap-1">
          📊 Atributos Secundarios
        </h3>
        <div class="space-y-2 text-xs font-bold font-mono">
          <div class="flex justify-between"><span>Puntos de Vida (HP)</span><span class="text-emerald-500">${sec.hp} / ${sec.maxHp}</span></div>
          <div class="flex justify-between"><span>Puntos de Maná (MP)</span><span class="text-cyan-500">${sec.mp} / ${sec.maxMp}</span></div>
          <div class="flex justify-between"><span>Estamina (Stamina)</span><span class="text-amber-500">${sec.stamina} / ${sec.maxStamina}</span></div>
          <hr class="border-stone-900 my-1" />
          <div class="flex justify-between"><span>Fuerza de Ataque</span><span class="text-white">${sec.attack}</span></div>
          <div class="flex justify-between"><span>Defensa Física</span><span class="text-white">${sec.defense}</span></div>
          <div class="flex justify-between"><span>Índice Crítico</span><span class="text-white">${sec.critical}%</span></div>
        </div>
      </div>
    </div>
  `;
}

// Renderiza la pestaña de habilidades
export function renderSkillsTab(charStats, onLearnSkill) {
  const container = document.getElementById('tab-content-container');
  if (!container) return;

  const learned = charStats.skills || [];

  container.innerHTML = `
    <div class="space-y-4 animate-fadeIn pr-1">
      <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 font-mono">Libro de Conjuros e Invocaciones</h3>
      
      <div class="grid grid-cols-1 gap-2.5">
        ${SKILLS_DATABASE.map(skill => {
          const isLearned = learned.includes(skill.id);
          return `
            <div class="p-3 rounded-2xl bg-stone-950/80 border border-stone-900 flex justify-between items-center gap-4 text-xs">
              <div class="min-w-0 leading-tight">
                <p class="font-extrabold text-white flex items-center gap-1.5">
                  <span class="text-purple-400">✦</span> ${skill.name}
                  <span class="text-[8px] px-1.5 py-0.5 bg-stone-900 text-stone-500 border border-stone-850 rounded uppercase font-bold tracking-widest">${skill.type}</span>
                </p>
                <p class="text-[10px] text-stone-400 mt-1 leading-normal font-medium">${skill.desc}</p>
                <p class="text-[9px] text-stone-500 mt-1 font-bold uppercase font-mono">Costo: ${skill.cost_mp} MP · ${skill.cost_stamina} Stamina</p>
              </div>
              <div class="shrink-0">
                ${isLearned ? (
                  `<span class="px-2.5 py-1 bg-emerald-950/20 text-emerald-500 border border-emerald-900/30 text-[10px] font-black uppercase rounded-full">Aprendido</span>`
                ) : (
                  `<button onclick="window.handleLearnSkillLocal('${skill.id}')" class="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase rounded-xl active:scale-95 transition-transform shadow">Aprender</button>`
                )}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Registrar variable global temporal para enlazar el click en vanilla JS
  window.handleLearnSkillLocal = onLearnSkill;
}

// Renderiza la pestaña del inventario de cartas de objetos
export function renderInventoryTab(inventory, onUseItem) {
  const container = document.getElementById('tab-content-container');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-4 animate-fadeIn pr-1">
      <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 font-mono">Bolsa del Otro Mundo</h3>
      
      <div class="grid grid-cols-1 gap-2.5">
        ${inventory.map(item => {
          const isConsumable = item.category === 'consumibles';
          return `
            <div class="p-3 rounded-2xl bg-stone-950/80 border border-stone-900 flex justify-between items-center gap-4 text-xs">
              <div class="min-w-0 leading-tight">
                <p class="font-extrabold text-white flex items-center gap-1.5">
                  <span class="text-amber-500">⚜</span> ${item.name}
                  <span class="text-[8px] px-1.5 py-0.5 bg-stone-900 text-stone-500 border border-stone-850 rounded uppercase font-bold tracking-widest font-mono">x${item.quantity}</span>
                </p>
                <p class="text-[10px] text-stone-400 mt-1 leading-normal font-medium">${item.desc}</p>
              </div>
              ${isConsumable ? (
                `<button onclick="window.handleUseItemLocal('${item.id}')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-xl active:scale-95 transition-transform shadow">Consumir</button>`
              ) : ''}
            </div>
          `;
        }).join('')}
        ${inventory.length === 0 ? (
          `<div class="py-12 text-center text-stone-600 text-xs font-medium">Bolsa vacía. No posees objetos aún.</div>`
        ) : ''}
      </div>
    </div>
  `;

  window.handleUseItemLocal = onUseItem;
}

// Renderiza la pestaña de relaciones con NPCs
export function renderNpcsTab(npcsList) {
  const container = document.getElementById('tab-content-container');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-4 animate-fadeIn pr-1">
      <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 font-mono">Vínculos y Memorias</h3>
      
      <div class="grid grid-cols-1 gap-3.5">
        ${npcsList.map(npc => {
          return `
            <div class="parchment-panel p-4 border border-stone-900 space-y-3.5">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-black text-sm text-white">${npc.name}</h4>
                  <p class="text-[9px] text-stone-500 font-bold uppercase font-mono mt-0.5">${npc.personality} · Edad: ${npc.age}</p>
                </div>
                <span class="text-lg">👤</span>
              </div>
              
              <p class="text-[10px] text-stone-400 leading-normal font-medium">${npc.history}</p>
              
              <div class="grid grid-cols-3 gap-2 text-center font-mono text-[9px] font-black uppercase tracking-wider">
                <div class="bg-stone-950 p-1.5 rounded-lg border border-stone-900">
                  <p class="text-stone-500">Confianza</p>
                  <p class="text-white text-xs font-black mt-1">${npc.trust}%</p>
                </div>
                <div class="bg-stone-950 p-1.5 rounded-lg border border-stone-900">
                  <p class="text-stone-500">Amistad</p>
                  <p class="text-white text-xs font-black mt-1">${npc.friendship}%</p>
                </div>
                <div class="bg-stone-950 p-1.5 rounded-lg border border-stone-900">
                  <p class="text-stone-500">Miedo</p>
                  <p class="text-white text-xs font-black mt-1">${npc.fear}%</p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Renderiza la pestaña del mapa de regiones interactivo
export function renderWorldTab(regionsList, onTravel) {
  const container = document.getElementById('tab-content-container');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-4 animate-fadeIn pr-1">
      <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 font-mono">Mapamundi de Ludus</h3>
      
      <div class="grid grid-cols-1 gap-3.5">
        ${regionsList.map(reg => {
          return `
            <div class="parchment-panel p-4 border border-stone-900 flex justify-between items-center gap-4 transition-all hover:border-purple-500/40">
              <div class="min-w-0 leading-tight space-y-1">
                <div class="flex items-center gap-2">
                  <h4 class="font-black text-xs text-white">${reg.name}</h4>
                  <span class="text-[8px] px-1.5 py-0.5 bg-stone-950 border border-stone-900 rounded font-bold text-stone-500 font-mono">${reg.difficulty}</span>
                </div>
                <p class="text-[10px] text-stone-400 leading-normal font-medium">${reg.desc}</p>
              </div>
              <div class="shrink-0">
                ${reg.unlocked ? (
                  `<button onclick="window.handleTravelLocal('${reg.id}')" class="px-3.5 py-2 bg-gradient-to-br from-purple-600 to-purple-800 text-white text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all shadow-md">Viajar</button>`
                ) : (
                  `<span class="px-2.5 py-1 bg-stone-950 text-stone-600 border border-stone-900 text-[9px] font-black uppercase rounded-full font-mono">Bloqueado</span>`
                )}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  window.handleTravelLocal = onTravel;
}
