import type { Effect } from '@/engine/schema';

/**
 * MISIONES DE NPC — misiones cortas fuera del arco principal.
 * Hablar con un NPC (pestaña Vínculos) muestra sus misiones disponibles.
 * Requisitos: nivel, poder de combate y/o nivel de vínculo.
 * Recompensas: XP, oro, objetos y — sobre todo — vínculo (que da poder).
 */

export interface NpcQuestDef {
  id: string;
  npcId: string;
  /** Requisitos para aceptarla. */
  requiredLevel: number;
  requiredPower: number;
  requiredBondLevel: number;
  /** Flag que la desbloquea (opcional, para atarlas a la historia). */
  requiresFlag?: string;
  /** Efectos al completarla (reutiliza el motor de efectos). */
  rewards: Effect[];
  /** Se resuelve al instante (conversación/entrega) en esta versión. */
  kind: 'talk' | 'delivery' | 'training';
}

export const NPC_QUESTS: NpcQuestDef[] = [
  // ── Marta (vitalidad) ──
  {
    id: 'nq_marta_recipes',
    npcId: 'marta',
    requiredLevel: 1,
    requiredPower: 0,
    requiredBondLevel: 0,
    kind: 'talk',
    rewards: [
      { kind: 'changeRelationship', target: 'marta', axis: 'friendship', amount: 10 },
      { kind: 'gainXp', amount: 10 }
    ]
  },
  {
    id: 'nq_marta_herbs',
    npcId: 'marta',
    requiredLevel: 2,
    requiredPower: 120,
    requiredBondLevel: 1,
    kind: 'delivery',
    rewards: [
      { kind: 'changeRelationship', target: 'marta', axis: 'trust', amount: 15 },
      { kind: 'addItem', key: 'healing_herb', amount: 3 },
      { kind: 'gainXp', amount: 20 }
    ]
  },
  // ── Joren (fuerza) ──
  {
    id: 'nq_joren_bellows',
    npcId: 'joren',
    requiredLevel: 2,
    requiredPower: 100,
    requiredBondLevel: 0,
    kind: 'training',
    rewards: [
      { kind: 'changeRelationship', target: 'joren', axis: 'respect', amount: 15 },
      { kind: 'gainXp', amount: 15 },
      { kind: 'gainGold', amount: 5 }
    ]
  },
  {
    id: 'nq_joren_ore',
    npcId: 'joren',
    requiredLevel: 3,
    requiredPower: 180,
    requiredBondLevel: 2,
    kind: 'delivery',
    rewards: [
      { kind: 'changeRelationship', target: 'joren', axis: 'trust', amount: 20 },
      { kind: 'addItem', key: 'reinforced_gloves', amount: 1 },
      { kind: 'gainXp', amount: 30 }
    ]
  },
  // ── Pip (suerte) ──
  {
    id: 'nq_pip_sling',
    npcId: 'pip',
    requiredLevel: 1,
    requiredPower: 0,
    requiredBondLevel: 0,
    kind: 'training',
    rewards: [
      { kind: 'changeRelationship', target: 'pip', axis: 'friendship', amount: 15 },
      { kind: 'gainXp', amount: 10 }
    ]
  },
  {
    id: 'nq_pip_dogs',
    npcId: 'pip',
    requiredLevel: 2,
    requiredPower: 110,
    requiredBondLevel: 1,
    kind: 'talk',
    rewards: [
      { kind: 'changeRelationship', target: 'pip', axis: 'trust', amount: 15 },
      { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 5 },
      { kind: 'gainXp', amount: 15 }
    ]
  },
  // ── Bren (voluntad) ──
  {
    id: 'nq_bren_patrol',
    npcId: 'capitan_bren',
    requiredLevel: 3,
    requiredPower: 200,
    requiredBondLevel: 1,
    kind: 'training',
    rewards: [
      { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 15 },
      { kind: 'gainXp', amount: 25 },
      { kind: 'gainGold', amount: 10 }
    ]
  },
  {
    id: 'nq_bren_letters',
    npcId: 'capitan_bren',
    requiredLevel: 4,
    requiredPower: 260,
    requiredBondLevel: 2,
    requiresFlag: 'poachers_mystery_open',
    kind: 'delivery',
    rewards: [
      { kind: 'changeRelationship', target: 'capitan_bren', axis: 'trust', amount: 20 },
      { kind: 'addItem', key: 'guard_insignia', amount: 1 },
      { kind: 'gainXp', amount: 35 }
    ]
  },
  // ── Lu (carisma) ──
  {
    id: 'nq_lu_spices',
    npcId: 'vendedora_lu',
    requiredLevel: 2,
    requiredPower: 120,
    requiredBondLevel: 0,
    requiresFlag: 'knows_serpent_warehouse',
    kind: 'delivery',
    rewards: [
      { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'friendship', amount: 15 },
      { kind: 'addItem', key: 'mana_flower', amount: 2 },
      { kind: 'gainXp', amount: 20 }
    ]
  },
  // ── Vela (inteligencia) ──
  {
    id: 'nq_vela_manifests',
    npcId: 'sargento_vela',
    requiredLevel: 3,
    requiredPower: 220,
    requiredBondLevel: 1,
    requiresFlag: 'letter_delivered',
    kind: 'talk',
    rewards: [
      { kind: 'changeRelationship', target: 'sargento_vela', axis: 'trust', amount: 15 },
      { kind: 'gainXp', amount: 30 }
    ]
  },
  // ── Tomás (agilidad) ──
  {
    id: 'nq_tomas_tracks',
    npcId: 'cazador_tomas',
    requiredLevel: 3,
    requiredPower: 200,
    requiredBondLevel: 0,
    requiresFlag: 'heard_hunters_serpent',
    kind: 'training',
    rewards: [
      { kind: 'changeRelationship', target: 'cazador_tomas', axis: 'respect', amount: 15 },
      { kind: 'gainXp', amount: 25 }
    ]
  }
];

export function questsForNpc(npcId: string): NpcQuestDef[] {
  return NPC_QUESTS.filter((q) => q.npcId === npcId);
}
