import type { Effect } from '@/engine/schema';

/**
 * MISIONES DE NPC REALES — nada de "tocar Hacer y ya".
 * Al ACEPTAR se activa la misión; hay que cumplir OBJETIVOS de verdad:
 *  - kill:    matar N enemigos concretos (explorando zonas)
 *  - collect: reunir N objetos (recolección/botín de monstruos)
 *  - explore: explorar N puntos de una zona
 *  - visit:   descubrir/pisar una región
 * Al completar todos, vuelves con el NPC y ENTREGAS (la recompensa
 * solo llega al entregar). Dos tipos: cortas (caza/recolección) y
 * largas multi-ETAPA con historia propia.
 */

export type ObjectiveKind = 'kill' | 'collect' | 'explore' | 'visit';

export interface QuestObjective {
  kind: ObjectiveKind;
  /** kill: enemyId · collect: itemId · explore: zoneId · visit: regionId */
  target: string;
  amount: number;
}

export interface QuestStage {
  id: string;
  objectives: QuestObjective[];
}

export interface NpcQuestDef {
  id: string;
  npcId: string;
  kind: 'short' | 'long';
  requiredLevel: number;
  requiredPower: number;
  requiredBondLevel: number;
  requiresFlag?: string;
  /** Etapas en orden (las cortas tienen 1; las largas varias). */
  stages: QuestStage[];
  /** collect: los objetos se consumen al entregar. */
  consumesItems: boolean;
  rewards: Effect[];
}

export const NPC_QUESTS: NpcQuestDef[] = [
  // ── CORTAS: caza y recolección ──
  {
    id: 'nq_marta_herbs',
    npcId: 'marta',
    kind: 'short',
    requiredLevel: 1,
    requiredPower: 0,
    requiredBondLevel: 0,
    consumesItems: true,
    stages: [{ id: 's1', objectives: [{ kind: 'collect', target: 'healing_herb', amount: 3 }] }],
    rewards: [
      { kind: 'changeRelationship', target: 'marta', axis: 'trust', amount: 12 },
      { kind: 'gainGold', amount: 8 },
      { kind: 'gainXp', amount: 20 }
    ]
  },
  {
    id: 'nq_bren_wolves',
    npcId: 'capitan_bren',
    kind: 'short',
    requiredLevel: 2,
    requiredPower: 120,
    requiredBondLevel: 0,
    consumesItems: false,
    stages: [{ id: 's1', objectives: [{ kind: 'kill', target: 'lobo_famelico', amount: 3 }] }],
    rewards: [
      { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 12 },
      { kind: 'gainGold', amount: 12 },
      { kind: 'gainXp', amount: 30 }
    ]
  },
  {
    id: 'nq_joren_ore',
    npcId: 'joren',
    kind: 'short',
    requiredLevel: 3,
    requiredPower: 160,
    requiredBondLevel: 1,
    consumesItems: true,
    stages: [{ id: 's1', objectives: [{ kind: 'collect', target: 'mineral_hierro', amount: 2 }] }],
    rewards: [
      { kind: 'changeRelationship', target: 'joren', axis: 'trust', amount: 15 },
      { kind: 'addItem', key: 'reinforced_gloves', amount: 1 },
      { kind: 'gainXp', amount: 35 }
    ]
  },
  {
    id: 'nq_tomas_boars',
    npcId: 'cazador_tomas',
    kind: 'short',
    requiredLevel: 3,
    requiredPower: 150,
    requiredBondLevel: 0,
    requiresFlag: 'heard_hunters_serpent',
    consumesItems: false,
    stages: [{ id: 's1', objectives: [{ kind: 'kill', target: 'jabali_bravo', amount: 2 }] }],
    rewards: [
      { kind: 'changeRelationship', target: 'cazador_tomas', axis: 'respect', amount: 15 },
      { kind: 'gainGold', amount: 10 },
      { kind: 'gainXp', amount: 30 }
    ]
  },
  // ── LARGAS: multi-etapa con historia ──
  {
    id: 'nq_pip_bigquest',
    npcId: 'pip',
    kind: 'long',
    requiredLevel: 2,
    requiredPower: 100,
    requiredBondLevel: 1,
    consumesItems: true,
    stages: [
      // Etapa 1: explorar el bosque con los ojos de Pip
      { id: 'explore_forest', objectives: [{ kind: 'explore', target: 'bosque_susurros', amount: 4 }] },
      // Etapa 2: reunir prueba de los lobos que asustan a los perros
      { id: 'wolf_proof', objectives: [{ kind: 'kill', target: 'lobo_famelico', amount: 2 }, { kind: 'collect', target: 'colmillo_lobo', amount: 1 }] }
    ],
    rewards: [
      { kind: 'changeRelationship', target: 'pip', axis: 'friendship', amount: 20 },
      { kind: 'changeRelationship', target: 'pip', axis: 'trust', amount: 15 },
      { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 5 },
      { kind: 'gainXp', amount: 60 },
      { kind: 'grantTitle', key: 'pip_hero' }
    ]
  },
  {
    id: 'nq_vela_evidence',
    npcId: 'sargento_vela',
    kind: 'long',
    requiredLevel: 4,
    requiredPower: 220,
    requiredBondLevel: 1,
    requiresFlag: 'letter_delivered',
    consumesItems: false,
    stages: [
      // Etapa 1: patear los bajos fondos de Zafir
      { id: 'zafir_recon', objectives: [{ kind: 'visit', target: 'puerto_zafir', amount: 1 }, { kind: 'explore', target: 'puerto_zafir', amount: 3 }] },
      // Etapa 2: desarticular a los matones del puerto
      { id: 'clean_docks', objectives: [{ kind: 'kill', target: 'furtivo_sierpe', amount: 2 }] }
    ],
    rewards: [
      { kind: 'changeRelationship', target: 'sargento_vela', axis: 'trust', amount: 20 },
      { kind: 'gainGold', amount: 30 },
      { kind: 'gainXp', amount: 70 },
      { kind: 'addItem', key: 'guard_insignia', amount: 1 }
    ]
  },
  {
    id: 'nq_lu_spice_route',
    npcId: 'vendedora_lu',
    kind: 'long',
    requiredLevel: 3,
    requiredPower: 180,
    requiredBondLevel: 1,
    requiresFlag: 'knows_serpent_warehouse',
    consumesItems: true,
    stages: [
      { id: 'gather_goods', objectives: [{ kind: 'collect', target: 'mana_flower', amount: 2 }] },
      { id: 'ruins_shortcut', objectives: [{ kind: 'explore', target: 'ruinas_veloran', amount: 3 }] }
    ],
    rewards: [
      { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'friendship', amount: 20 },
      { kind: 'gainGold', amount: 25 },
      { kind: 'gainXp', amount: 55 }
    ]
  }
];

export function questsForNpc(npcId: string): NpcQuestDef[] {
  return NPC_QUESTS.filter((q) => q.npcId === npcId);
}

export function npcQuestById(id: string): NpcQuestDef {
  const q = NPC_QUESTS.find((q) => q.id === id);
  if (!q) throw new Error(`Misión NPC desconocida: ${id}`);
  return q;
}
