import type { NpcDef, RegionDef } from '@/domain/types';

/** Regiones iniciales (§21). El mundo se amplía añadiendo entradas. */
export const REGIONS: RegionDef[] = [
  { id: 'aldea_brumal', kind: 'village', connectedTo: ['bosque_susurros'], discoveredByDefault: true },
  { id: 'bosque_susurros', kind: 'forest', connectedTo: ['aldea_brumal', 'ciudad_petra'], discoveredByDefault: false },
  { id: 'ciudad_petra', kind: 'city', connectedTo: ['bosque_susurros', 'ruinas_veloran', 'templo_alba'], discoveredByDefault: false },
  { id: 'ruinas_veloran', kind: 'ruins', connectedTo: ['ciudad_petra'], discoveredByDefault: false },
  { id: 'templo_alba', kind: 'temple', connectedTo: ['ciudad_petra'], discoveredByDefault: false },
  { id: 'puerto_zafir', kind: 'city', connectedTo: ['ciudad_petra'], discoveredByDefault: false },
  { id: 'tierras_ignotas', kind: 'unknown', connectedTo: [], discoveredByDefault: false }
];

/**
 * NPC iniciales con relaciones persistentes (§19-20).
 * Cada NPC tiene biografía completa (claves npc.<id>.bio en i18n):
 * historia, dónde vive, qué quiere, qué teme. El mundo está habitado.
 */
export const NPCS: NpcDef[] = [
  { id: 'marta', bondStat: 'vitality', regionId: 'aldea_brumal', profession: 'innkeeper', age: 54, initialRelationships: { trust: 10 } },
  { id: 'joren', bondStat: 'strength', regionId: 'aldea_brumal', profession: 'blacksmith', age: 41, initialRelationships: {} },
  { id: 'pip', bondStat: 'luck', regionId: 'aldea_brumal', profession: 'orphan', age: 11, initialRelationships: { friendship: 5 } },
  { id: 'capitan_bren', bondStat: 'willpower', regionId: 'aldea_brumal', profession: 'guard_captain', age: 47, initialRelationships: { respect: 0 } },
  { id: 'vendedora_lu', bondStat: 'charisma', regionId: 'ciudad_petra', profession: 'merchant', age: 33, initialRelationships: {} },
  { id: 'sargento_vela', bondStat: 'intelligence', regionId: 'ciudad_petra', profession: 'canal_guard', age: 29, initialRelationships: {} },
  { id: 'cazador_tomas', bondStat: 'agility', regionId: 'ciudad_petra', profession: 'hunter', age: 61, initialRelationships: {} }
];

export const regionById = (id: string) => {
  const r = REGIONS.find((r) => r.id === id);
  if (!r) throw new Error(`Región desconocida: ${id}`);
  return r;
};
