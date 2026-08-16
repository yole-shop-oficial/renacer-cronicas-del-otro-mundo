import { create } from 'zustand';
import type { CharacterState, GameSave, WorldState, RelationshipBlock } from '@/domain/types';
import { deriveStats, mergeStats } from '@/domain/stats';
import { createStoryEngine, FIRST_NODE_ID } from '@/content/story';
import type { Choice } from '@/engine/schema';
import { templateById } from '@/data/characters';
import { classById } from '@/data/classes';
import { goddessById } from '@/data/goddesses';
import { NPCS, REGIONS } from '@/data/world';
import { itemById } from '@/data/items';
import { treeNodeById, canLearnNode } from '@/data/skilltree';
import { NPC_QUESTS, type NpcQuestDef } from '@/data/npcQuests';
import { POIS } from '@/data/pois';
import { applyEffects } from '@/engine/effects';
import { bondLevel, combatPower } from '@/domain/power';
import type { PrimaryStat, EquipmentSlot } from '@/domain/types';
import { saveGameLocally, queueDecision, queueSnapshot } from './persistence';

/**
 * STORE DEL JUEGO — une motor narrativo, estado y persistencia.
 * Cada decisión importante = LOCAL SAVE + operación en cola (§43).
 */

export const SCHEMA_VERSION = 2;
const engine = createStoryEngine();

export interface NarrationEntry {
  key: string;
  params?: Record<string, string | number>;
}

interface GameStoreState {
  save: GameSave | null;
  narrationLog: NarrationEntry[];
  createNewGame: (opts: {
    templateId: string;
    name: string;
    classId: string;
    goddessId: string;
  }) => Promise<GameSave>;
  loadGame: (save: GameSave) => void;
  chooseOption: (choice: Choice) => Promise<void>;
  currentNode: () => ReturnType<typeof engine.getNode> | null;
  choicesForCurrentNode: () => { available: Choice[]; locked: Choice[] };
  /** Sistema de atributos: gastar puntos de nivel (+10/nivel). */
  spendAttributePoint: (stat: PrimaryStat, amount?: number) => Promise<void>;
  /** Árbol de habilidades: aprender un nodo. */
  learnTreeNode: (nodeId: string) => Promise<void>;
  /** Equipamiento: equipar / desequipar objetos con slot. */
  equipItem: (itemId: string) => Promise<void>;
  unequipSlot: (slot: EquipmentSlot) => Promise<void>;
  /** Misiones de NPC: completar una misión disponible. */
  completeNpcQuest: (questId: string) => Promise<void>;
  /** Misiones de NPC disponibles ahora mismo para un NPC. */
  availableNpcQuests: (npcId: string) => { quest: NpcQuestDef; ok: boolean; reason?: string }[];
  /** Puntos de recorrido del mapa: realizar una acción de un punto. */
  performPoiAction: (poiId: string, actionId: string) => Promise<void>;
}

function buildInitialWorld(): WorldState {
  const npcRelationships: Record<string, RelationshipBlock> = {};
  for (const npc of NPCS) {
    npcRelationships[npc.id] = {
      trust: npc.initialRelationships.trust ?? 0,
      friendship: npc.initialRelationships.friendship ?? 0,
      respect: npc.initialRelationships.respect ?? 0,
      fear: npc.initialRelationships.fear ?? 0,
      affection: npc.initialRelationships.affection ?? 0,
      rivalry: npc.initialRelationships.rivalry ?? 0
    };
  }
  return {
    flags: {},
    discoveredRegions: REGIONS.filter((r) => r.discoveredByDefault).map((r) => r.id),
    currentRegionId: 'aldea_brumal',
    npcRelationships,
    npcMemory: {},
    quests: [],
    decisions: []
  };
}

function buildCharacter(opts: {
  templateId: string;
  name: string;
  classId: string;
  goddessId: string;
}): CharacterState {
  const template = templateById(opts.templateId);
  const cls = classById(opts.classId);
  const goddess = goddessById(opts.goddessId);

  let stats = mergeStats(template.baseStats, cls.baseStats);
  stats = mergeStats(stats, { [goddess.blessing.stat]: goddess.blessing.bonus });

  const skills = [...new Set([...cls.startingSkills, ...(goddess.grantsSkill ? [goddess.grantsSkill] : [])])];
  const derived = deriveStats(stats, 1);

  // Equipar automáticamente los objetos iniciales que tengan slot.
  const equipment: CharacterState['equipment'] = {};
  for (const itemId of cls.startingItems) {
    try {
      const item = itemById(itemId);
      if (item.slot && !equipment[item.slot]) equipment[item.slot] = itemId;
    } catch {
      /* sin slot */
    }
  }

  return {
    id: crypto.randomUUID(),
    templateId: opts.templateId,
    name: opts.name.trim() || template.defaultName,
    gender: template.gender,
    classId: opts.classId,
    goddessId: opts.goddessId,
    level: 1,
    xp: 0,
    stats,
    unspentPoints: 0,
    skillPoints: 0,
    treeNodes: [],
    currentHp: derived.hp,
    currentMp: derived.mp,
    skills,
    inventory: cls.startingItems.map((itemId) => ({
      itemId,
      quantity: 1,
      equipped: Boolean(equipment[itemById(itemId).slot ?? 'weapon'] === itemId)
    })),
    equipment,
    gold: 0,
    titles: [],
    reputation: {}
  };
}

/** Persistir un save mutado: LOCAL primero, luego cola (§43). */
async function persist(save: GameSave): Promise<GameSave> {
  const updated = { ...save, updatedAt: Date.now() };
  await saveGameLocally(updated);
  await queueSnapshot(updated, 'SAVE_SNAPSHOT');
  return updated;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  save: null,
  narrationLog: [],

  createNewGame: async (opts) => {
    const character = buildCharacter(opts);
    const save: GameSave = {
      gameId: crypto.randomUUID(),
      characterId: character.id,
      currentNodeId: FIRST_NODE_ID,
      character,
      world: buildInitialWorld(),
      updatedAt: Date.now(),
      schemaVersion: SCHEMA_VERSION
    };
    set({ save, narrationLog: [] });
    await saveGameLocally(save);
    await queueSnapshot(save, 'CREATE_CHARACTER');
    return save;
  },

  loadGame: (rawSave) => {
    const save = migrateSave(rawSave);
    set({ save, narrationLog: [] });
    // Aplicar efectos de entrada pendientes del nodo actual (idempotente).
    const state = get();
    const node = state.currentNode();
    if (node && save) {
      const r = engine.enterNode(node, save.character, save.world);
      if (r.log.length > 0 || r.world !== save.world) {
        const updated = { ...save, character: r.character, world: r.world, updatedAt: Date.now() };
        set({ save: updated, narrationLog: r.log });
        void saveGameLocally(updated);
      }
    }
  },

  chooseOption: async (choice) => {
    const { save } = get();
    if (!save) return;
    const node = engine.getNode(save.currentNodeId);
    const decisionId = crypto.randomUUID();

    const result = engine.choose(node, choice, save.character, save.world, decisionId);
    const nextNode = engine.getNode(result.nextNodeId);
    const entered = engine.enterNode(nextNode, result.character, result.world);

    const updated: GameSave = {
      ...save,
      character: entered.character,
      world: entered.world,
      currentNodeId: result.nextNodeId,
      updatedAt: Date.now(),
      schemaVersion: SCHEMA_VERSION
    };

    // Persistencia PRIMERO (§43: LOCAL SAVE antes que nada) y UI después.
    // Evita la carrera en la que un cierre/recarga inmediato pierde la
    // última decisión (integridad del progreso §81 > latencia de ~ms).
    await saveGameLocally(updated);
    await queueDecision(updated.gameId, decisionId, node.id, choice.id);
    await queueSnapshot(updated, 'SAVE_SNAPSHOT');

    set({ save: updated, narrationLog: [...result.log, ...entered.log] });
  },

  currentNode: () => {
    const { save } = get();
    if (!save) return null;
    try {
      return engine.getNode(save.currentNodeId);
    } catch {
      return null;
    }
  },

  choicesForCurrentNode: () => {
    const { save } = get();
    if (!save) return { available: [], locked: [] };
    const node = engine.getNode(save.currentNodeId);
    return engine.availableChoices(node, save.character, save.world);
  },

  spendAttributePoint: async (stat, amount = 1) => {
    const { save } = get();
    if (!save) return;
    const points = Math.min(amount, save.character.unspentPoints ?? 0);
    if (points <= 0) return;
    const character = structuredClone(save.character);
    character.stats[stat] += points;
    character.unspentPoints -= points;
    const updated = await persist({ ...save, character });
    set({ save: updated });
  },

  learnTreeNode: async (nodeId) => {
    const { save } = get();
    if (!save) return;
    const node = treeNodeById(nodeId);
    const c = save.character;
    const check = canLearnNode(node, {
      level: c.level,
      skillPoints: c.skillPoints ?? 0,
      learnedNodes: c.treeNodes ?? []
    });
    if (!check.ok || node.classId !== c.classId) return;

    const character = structuredClone(c);
    character.skillPoints -= node.cost;
    character.treeNodes = [...(character.treeNodes ?? []), node.id];
    for (const [stat, value] of Object.entries(node.statBonus ?? {})) {
      character.stats[stat as PrimaryStat] += value ?? 0;
    }
    if (node.unlocksSkill && !character.skills.includes(node.unlocksSkill)) {
      character.skills.push(node.unlocksSkill);
    }
    const updated = await persist({ ...save, character });
    set({ save: updated, narrationLog: [{ key: 'log.treeNodeLearned', params: { node: node.id } }] });
  },

  equipItem: async (itemId) => {
    const { save } = get();
    if (!save) return;
    const item = itemById(itemId);
    if (!item.slot) return;
    const c = save.character;
    if (!c.inventory.some((e) => e.itemId === itemId && e.quantity > 0)) return;
    if (item.restrictions?.minLevel && c.level < item.restrictions.minLevel) return;
    if (item.restrictions?.classIds && !item.restrictions.classIds.includes(c.classId)) return;

    const character = structuredClone(c);
    const previous = character.equipment[item.slot];
    character.equipment[item.slot] = itemId;
    for (const entry of character.inventory) {
      if (entry.itemId === itemId) entry.equipped = true;
      else if (entry.itemId === previous) entry.equipped = false;
    }
    const updated = await persist({ ...save, character });
    set({ save: updated });
  },

  unequipSlot: async (slot) => {
    const { save } = get();
    if (!save) return;
    const character = structuredClone(save.character);
    const itemId = character.equipment[slot];
    if (!itemId) return;
    delete character.equipment[slot];
    for (const entry of character.inventory) {
      if (entry.itemId === itemId) entry.equipped = false;
    }
    const updated = await persist({ ...save, character });
    set({ save: updated });
  },

  completeNpcQuest: async (questId) => {
    const { save } = get();
    if (!save) return;
    const quest = NPC_QUESTS.find((q) => q.id === questId);
    if (!quest) return;
    // Revalidar requisitos y no repetir (idempotente).
    const doneFlag = `_nq_done_${quest.id}`;
    if (save.world.flags[doneFlag]) return;
    const status = checkQuestRequirements(quest, save);
    if (!status.ok) return;

    const result = applyEffects(quest.rewards, save.character, save.world);
    result.world.flags[doneFlag] = true;
    const updated = await persist({ ...save, character: result.character, world: result.world });
    set({ save: updated, narrationLog: result.log });
  },

  availableNpcQuests: (npcId) => {
    const { save } = get();
    if (!save) return [];
    const list = npcId ? NPC_QUESTS.filter((q) => q.npcId === npcId) : NPC_QUESTS;
    return list
      .filter((q) => !save.world.flags[`_nq_done_${q.id}`])
      .filter((q) => !q.requiresFlag || Boolean(save.world.flags[q.requiresFlag]))
      .map((quest) => {
        const status = checkQuestRequirements(quest, save);
        return { quest, ok: status.ok, reason: status.reason };
      });
  },

  performPoiAction: async (poiId, actionId) => {
    const { save } = get();
    if (!save) return;
    const poi = POIS.find((p) => p.id === poiId);
    const action = poi?.actions.find((a) => a.id === actionId);
    if (!poi || !action) return;
    // Idempotente: cada acción de punto solo una vez.
    const doneFlag = `_poi_act_${action.id}`;
    if (save.world.flags[doneFlag]) return;
    // Revalidar requisitos.
    const c = save.character;
    if (action.requiredLevel && c.level < action.requiredLevel) return;
    if (action.requiredPower && combatPower(c, NPCS, save.world) < action.requiredPower) return;
    if (action.requiresFlag && !save.world.flags[action.requiresFlag]) return;

    const result = applyEffects(action.effects, save.character, save.world);
    result.world.flags[doneFlag] = true;
    // Si todas las acciones del punto están hechas, marcar el punto.
    if (poi.actions.every((a) => result.world.flags[`_poi_act_${a.id}`])) {
      result.world.flags[`_poi_done_${poi.id}`] = true;
    }
    const updated = await persist({ ...save, character: result.character, world: result.world });
    set({ save: updated, narrationLog: result.log });
  }
}));

/**
 * Migración de guardados de versiones anteriores del esquema:
 * completa campos nuevos con valores seguros (§77: nunca perder progreso).
 */
function migrateSave(save: GameSave): GameSave {
  const c = save.character;
  const migrated: GameSave = {
    ...save,
    character: {
      ...c,
      gender: c.gender ?? templateById(c.templateId).gender,
      unspentPoints: c.unspentPoints ?? Math.max(0, (c.level - 1) * 10),
      skillPoints: c.skillPoints ?? Math.max(0, c.level - 1),
      treeNodes: c.treeNodes ?? [],
      equipment: c.equipment ?? {}
    },
    schemaVersion: SCHEMA_VERSION
  };
  // Equipar retroactivamente lo marcado como equipped en el inventario.
  if (!c.equipment) {
    for (const entry of migrated.character.inventory) {
      if (!entry.equipped) continue;
      try {
        const item = itemById(entry.itemId);
        if (item.slot && !migrated.character.equipment[item.slot]) {
          migrated.character.equipment[item.slot] = entry.itemId;
        }
      } catch {
        /* objeto desconocido */
      }
    }
  }
  return migrated;
}

function checkQuestRequirements(
  quest: NpcQuestDef,
  save: GameSave
): { ok: boolean; reason?: string } {
  const c = save.character;
  if (c.level < quest.requiredLevel) return { ok: false, reason: 'level' };
  const power = combatPower(c, NPCS, save.world);
  if (power < quest.requiredPower) return { ok: false, reason: 'power' };
  const rel = save.world.npcRelationships[quest.npcId];
  if (rel && bondLevel(rel) < quest.requiredBondLevel) return { ok: false, reason: 'bond' };
  if (!rel && quest.requiredBondLevel > 0) return { ok: false, reason: 'bond' };
  return { ok: true };
}
