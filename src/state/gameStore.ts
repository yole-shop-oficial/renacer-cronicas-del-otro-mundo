import { create } from 'zustand';
import type { CharacterState, GameSave, WorldState, RelationshipBlock } from '@/domain/types';
import { deriveStats, mergeStats } from '@/domain/stats';
import { createStoryEngine, FIRST_NODE_ID } from '@/content/story';
import type { Choice } from '@/engine/schema';
import { templateById } from '@/data/characters';
import { classById } from '@/data/classes';
import { goddessById } from '@/data/goddesses';
import { NPCS, REGIONS } from '@/data/world';
import { saveGameLocally, queueDecision, queueSnapshot } from './persistence';

/**
 * STORE DEL JUEGO — une motor narrativo, estado y persistencia.
 * Cada decisión importante = LOCAL SAVE + operación en cola (§43).
 */

export const SCHEMA_VERSION = 1;
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

  return {
    id: crypto.randomUUID(),
    templateId: opts.templateId,
    name: opts.name.trim() || template.defaultName,
    classId: opts.classId,
    goddessId: opts.goddessId,
    level: 1,
    xp: 0,
    stats,
    currentHp: derived.hp,
    currentMp: derived.mp,
    skills,
    inventory: cls.startingItems.map((itemId) => ({ itemId, quantity: 1, equipped: true })),
    gold: 0,
    titles: [],
    reputation: {}
  };
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

  loadGame: (save) => {
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

    set({ save: updated, narrationLog: [...result.log, ...entered.log] });

    // Persistencia: primero local, luego cola → nube (§24, §43).
    await saveGameLocally(updated);
    await queueDecision(updated.gameId, decisionId, node.id, choice.id);
    await queueSnapshot(updated, 'SAVE_SNAPSHOT');
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
  }
}));
