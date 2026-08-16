import type { Effect } from '@/engine/schema';
import type { IconName } from '@/ui/icons';

/**
 * PUNTOS DE RECORRIDO DEL MAPA.
 * Cada región tiene lugares señalados: al tocarlos se entra y ocurren
 * eventos/acciones con recompensas (una sola vez, deduplicado por flag).
 * Algunos exigen nivel/poder o flags de la historia.
 */

export interface PoiAction {
  id: string;
  /** Recompensas al realizarla (motor de efectos). Solo una vez. */
  effects: Effect[];
  requiredLevel?: number;
  requiredPower?: number;
  requiresFlag?: string;
}

export interface PoiDef {
  id: string;
  regionId: string;
  icon: IconName;
  /** Posición relativa dentro del plano de la región (0-100). */
  x: number;
  y: number;
  actions: PoiAction[];
}

export const POIS: PoiDef[] = [
  // ── ALDEA BRUMAL ──
  {
    id: 'poi_farol_dorado',
    regionId: 'aldea_brumal',
    icon: 'village',
    x: 32,
    y: 38,
    actions: [
      {
        id: 'act_farol_rest',
        effects: [
          { kind: 'heal', amount: 50 },
          { kind: 'changeRelationship', target: 'marta', axis: 'friendship', amount: 5 }
        ]
      }
    ]
  },
  {
    id: 'poi_forja_joren',
    regionId: 'aldea_brumal',
    icon: 'ore',
    x: 62,
    y: 30,
    actions: [
      {
        id: 'act_forge_watch',
        effects: [
          { kind: 'gainXp', amount: 10 },
          { kind: 'changeRelationship', target: 'joren', axis: 'respect', amount: 5 }
        ]
      }
    ]
  },
  {
    id: 'poi_pozo_plaza',
    regionId: 'aldea_brumal',
    icon: 'drop',
    x: 46,
    y: 55,
    actions: [
      {
        id: 'act_well_coin',
        effects: [
          { kind: 'gainGold', amount: -1 },
          { kind: 'changeStat', key: 'luck', amount: 1 },
          { kind: 'setFlag', key: 'wished_at_well', value: true }
        ]
      }
    ]
  },
  {
    id: 'poi_cuartel_norte',
    regionId: 'aldea_brumal',
    icon: 'shield',
    x: 50,
    y: 14,
    actions: [
      {
        id: 'act_guard_training',
        requiredLevel: 2,
        requiredPower: 150,
        effects: [
          { kind: 'gainXp', amount: 20 },
          { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 8 }
        ]
      }
    ]
  },
  // ── BOSQUE DE LOS SUSURROS ──
  {
    id: 'poi_arroyo_curva',
    regionId: 'bosque_susurros',
    icon: 'drop',
    x: 40,
    y: 46,
    actions: [
      {
        id: 'act_stream_listen',
        effects: [
          { kind: 'gainXp', amount: 12 },
          { kind: 'setFlag', key: 'listened_to_stream', value: true }
        ]
      }
    ]
  },
  {
    id: 'poi_claro_luz',
    regionId: 'bosque_susurros',
    icon: 'spark',
    x: 64,
    y: 26,
    actions: [
      {
        id: 'act_clearing_meditate',
        requiredLevel: 2,
        effects: [
          { kind: 'gainXp', amount: 15 },
          { kind: 'changeStat', key: 'willpower', amount: 1 }
        ]
      }
    ]
  },
  {
    id: 'poi_cueva_niebla',
    regionId: 'bosque_susurros',
    icon: 'mystery',
    x: 22,
    y: 22,
    actions: [
      {
        id: 'act_mist_den',
        requiresFlag: 'freed_mist_creature',
        effects: [
          { kind: 'addItem', key: 'moonlit_mushroom', amount: 2 },
          { kind: 'gainXp', amount: 25 },
          { kind: 'setFlag', key: 'visited_mist_den', value: true }
        ]
      }
    ]
  },
  {
    id: 'poi_trampa_rota',
    regionId: 'bosque_susurros',
    icon: 'poi',
    x: 76,
    y: 62,
    actions: [
      {
        id: 'act_trap_study',
        requiresFlag: 'poachers_mystery_open',
        effects: [
          { kind: 'gainXp', amount: 18 },
          { kind: 'setFlag', key: 'studied_trap_site', value: true }
        ]
      }
    ]
  },
  // ── CIUDAD DE PETRA ──
  {
    id: 'poi_mercado_lu',
    regionId: 'ciudad_petra',
    icon: 'coin',
    x: 44,
    y: 42,
    actions: [
      {
        id: 'act_market_tea',
        effects: [
          { kind: 'heal', amount: 20 },
          { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'friendship', amount: 5 }
        ]
      }
    ]
  },
  {
    id: 'poi_ancla_rota',
    regionId: 'ciudad_petra',
    icon: 'potion',
    x: 22,
    y: 62,
    actions: [
      {
        id: 'act_tavern_round',
        requiresFlag: 'visited_tavern',
        effects: [
          { kind: 'gainGold', amount: -3 },
          { kind: 'changeRelationship', target: 'cazador_tomas', axis: 'friendship', amount: 8 },
          { kind: 'gainXp', amount: 10 }
        ]
      }
    ]
  },
  {
    id: 'poi_torre_canal',
    regionId: 'ciudad_petra',
    icon: 'shield',
    x: 68,
    y: 30,
    actions: [
      {
        id: 'act_canal_watch',
        requiresFlag: 'letter_delivered',
        requiredLevel: 3,
        effects: [
          { kind: 'gainXp', amount: 22 },
          { kind: 'changeRelationship', target: 'sargento_vela', axis: 'respect', amount: 8 }
        ]
      }
    ]
  },
  {
    id: 'poi_muelle_tres',
    regionId: 'ciudad_petra',
    icon: 'poi',
    x: 80,
    y: 70,
    actions: [
      {
        id: 'act_pier_inspect',
        requiresFlag: 'servan_vell_arc_open',
        requiredPower: 220,
        effects: [
          { kind: 'gainXp', amount: 30 },
          { kind: 'setFlag', key: 'pier_evidence_found', value: true }
        ]
      }
    ]
  },
  // ── RUINAS DE VELORAN ──
  {
    id: 'poi_arco_caido',
    regionId: 'ruinas_veloran',
    icon: 'ruins',
    x: 38,
    y: 36,
    actions: [
      {
        id: 'act_arch_inscription',
        requiredLevel: 4,
        effects: [
          { kind: 'gainXp', amount: 28 },
          { kind: 'setFlag', key: 'read_veloran_inscription', value: true }
        ]
      }
    ]
  },
  {
    id: 'poi_camara_sellada',
    regionId: 'ruinas_veloran',
    icon: 'lock',
    x: 66,
    y: 58,
    actions: [
      {
        id: 'act_sealed_chamber',
        requiredLevel: 5,
        requiredPower: 300,
        effects: [
          { kind: 'addItem', key: 'old_locket', amount: 1 },
          { kind: 'gainXp', amount: 40 },
          { kind: 'setFlag', key: 'opened_sealed_chamber', value: true }
        ]
      }
    ]
  },
  // ── TEMPLO DEL ALBA ──
  {
    id: 'poi_altar_alba',
    regionId: 'templo_alba',
    icon: 'temple',
    x: 50,
    y: 34,
    actions: [
      {
        id: 'act_altar_pray',
        requiredLevel: 3,
        effects: [
          { kind: 'heal', amount: 999 },
          { kind: 'gainXp', amount: 15 },
          { kind: 'setFlag', key: 'prayed_at_dawn_altar', value: true }
        ]
      }
    ]
  },
  {
    id: 'poi_jardin_novicias',
    regionId: 'templo_alba',
    icon: 'spark',
    x: 30,
    y: 62,
    actions: [
      {
        id: 'act_garden_nara',
        requiresFlag: 'knows_bren_story',
        effects: [
          { kind: 'gainXp', amount: 20 },
          { kind: 'setFlag', key: 'met_nara_garden', value: true },
          { kind: 'addNpcMemory', target: 'capitan_bren', value: 'player_visited_nara' }
        ]
      }
    ]
  }
];

export function poisForRegion(regionId: string): PoiDef[] {
  return POIS.filter((p) => p.regionId === regionId);
}
