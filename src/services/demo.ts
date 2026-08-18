import type { GameSave } from '@/domain/types';

/**
 * MODO DEMO (§97) — probar el juego sin destruir datos reales.
 * Crea una partida efímera de nivel alto en un gameId reservado que
 * NUNCA se persiste sobre la partida real: vive solo en memoria y se
 * descarta al salir. Permite experimentar combate, historia y sistemas.
 */

export const DEMO_GAME_ID = '__demo__';

export function isDemoSave(save: GameSave | null): boolean {
  return save?.gameId === DEMO_GAME_ID;
}

/** Partida de demostración: heroína veterana lista para probarlo todo. */
export function createDemoSave(): GameSave {
  return {
    gameId: DEMO_GAME_ID,
    characterId: 'demo-soul',
    currentNodeId: 'c1_05',
    character: {
      id: 'demo-soul',
      templateId: 'thessa',
      name: 'Ensueño',
      gender: 'f',
      classId: 'mage',
      goddessId: 'nyxara',
      level: 6,
      xp: 40,
      stats: { strength: 8, intelligence: 16, agility: 10, vitality: 10, luck: 8, willpower: 12, charisma: 9 },
      unspentPoints: 10,
      skillPoints: 3,
      treeNodes: ['mage_arcano_1'],
      currentHp: 145,
      currentMp: 130,
      skills: ['fireball', 'arcane_missile', 'meteor', 'clarity', 'detect_magic', 'analyze', 'persuasion'],
      inventory: [
        { itemId: 'apprentice_staff', quantity: 1, equipped: true },
        { itemId: 'blessed_amulet', quantity: 1, equipped: true },
        { itemId: 'healing_herb', quantity: 5 },
        { itemId: 'mana_flower', quantity: 3 }
      ],
      equipment: { weapon: 'apprentice_staff', accessory: 'blessed_amulet' },
      gold: 120,
      titles: ['friend_of_the_mist'],
      reputation: { aldea_brumal: 10 },
      personality: { curiosity: 4, compassion: 3, courage: 2 }
    },
    world: {
      flags: {
        accepted_rebirth: true,
        met_pip: true,
        pip_told_creature_scared: true,
        knows_bren_story: true,
        won_first_combat: true,
        knows_creature_limps: true,
        walked_village: true,
        met_joren: true
      },
      discoveredRegions: ['aldea_brumal', 'bosque_susurros', 'ciudad_petra'],
      currentRegionId: 'bosque_susurros',
      npcRelationships: {
        marta: { trust: 30, friendship: 25, respect: 5, fear: 0, affection: 10, rivalry: 0 },
        pip: { trust: 25, friendship: 30, respect: 5, fear: 0, affection: 5, rivalry: 0 },
        joren: { trust: 20, friendship: 15, respect: 10, fear: 0, affection: 0, rivalry: 0 },
        capitan_bren: { trust: 10, friendship: 0, respect: 20, fear: 0, affection: 0, rivalry: 0 }
      },
      npcMemory: { pip: ['player_believed_pip'] },
      quests: [
        { questId: 'quest_first_steps', status: 'completed', progress: {} },
        { questId: 'quest_whispering_forest', status: 'active', progress: {} }
      ],
      decisions: [
        { id: 'demo-d1', nodeId: 'pro_01', choiceId: 'pro_01_photo', at: Date.now() - 3600_000 },
        { id: 'demo-d2', nodeId: 'c1_02', choiceId: 'c1_02_honest', at: Date.now() - 1800_000 }
      ]
    },
    updatedAt: Date.now(),
    schemaVersion: 2
  };
}
