/**
 * ZONAS EXPLORABLES — mini-mapa de puntos conectados por zona.
 * Explorar de verdad: entras a la zona y avanzas por una red de
 * lugares (claro → arroyo → cueva...). Cada punto trae combate,
 * evento, tesoro, recolección o descanso. Nivel de peligro ☠ 1-5.
 */

export type ZoneNodeKind = 'start' | 'combat' | 'event' | 'treasure' | 'gather' | 'rest';

export interface ZoneNode {
  id: string;
  kind: ZoneNodeKind;
  /** Posición en el plano de la zona (0-100). */
  x: number;
  y: number;
  /** Conexiones (ids de otros nodos de la zona). */
  connects: string[];
  /** combat: enemigo concreto (si falta, sale del pool de la zona). */
  enemyId?: string;
  /** gather: objeto que se recoge aquí. */
  itemId?: string;
  /** treasure: oro base. */
  gold?: number;
}

export interface ZoneDef {
  id: string;
  regionId: string;
  /** Nivel de peligro ☠ 1-5 (visible; entrar por encima de tu nivel es arriesgado). */
  danger: 1 | 2 | 3 | 4 | 5;
  /** Nivel recomendado. */
  suggestedLevel: number;
  /** Enemigos que aparecen en nodos de combate sin enemigo fijo. */
  monsterPool: string[];
  nodes: ZoneNode[];
}

export const ZONES: ZoneDef[] = [
  {
    id: 'bosque_susurros',
    regionId: 'bosque_susurros',
    danger: 1,
    suggestedLevel: 1,
    monsterPool: ['lobo_famelico', 'jabali_bravo'],
    nodes: [
      { id: 'linde', kind: 'start', x: 14, y: 82, connects: ['senda'] },
      { id: 'senda', kind: 'event', x: 30, y: 66, connects: ['linde', 'claro_setas', 'arroyo'] },
      { id: 'claro_setas', kind: 'gather', x: 18, y: 44, connects: ['senda', 'espesura'], itemId: 'healing_herb' },
      { id: 'arroyo', kind: 'rest', x: 48, y: 58, connects: ['senda', 'guarida', 'espesura'] },
      { id: 'guarida', kind: 'combat', x: 64, y: 74, connects: ['arroyo', 'hondonada'], enemyId: 'lobo_famelico' },
      { id: 'espesura', kind: 'combat', x: 44, y: 32, connects: ['claro_setas', 'arroyo', 'hondonada'], enemyId: 'jabali_bravo' },
      { id: 'hondonada', kind: 'treasure', x: 72, y: 46, connects: ['guarida', 'espesura', 'corazon'], gold: 12 },
      { id: 'corazon', kind: 'event', x: 84, y: 22, connects: ['hondonada'] }
    ]
  },
  {
    id: 'puerto_zafir',
    regionId: 'puerto_zafir',
    danger: 2,
    suggestedLevel: 4,
    monsterPool: ['furtivo_sierpe', 'corsario_zafir'],
    nodes: [
      { id: 'muelles', kind: 'start', x: 16, y: 76, connects: ['callejon'] },
      { id: 'callejon', kind: 'event', x: 34, y: 62, connects: ['muelles', 'almacen', 'atalaya'] },
      { id: 'almacen', kind: 'combat', x: 52, y: 74, connects: ['callejon', 'bodega'], enemyId: 'furtivo_sierpe' },
      { id: 'bodega', kind: 'gather', x: 68, y: 82, connects: ['almacen', 'faro_viejo'], itemId: 'mana_flower' },
      { id: 'atalaya', kind: 'rest', x: 50, y: 36, connects: ['callejon', 'faro_viejo'] },
      { id: 'faro_viejo', kind: 'combat', x: 72, y: 50, connects: ['bodega', 'atalaya', 'cala'], enemyId: 'corsario_zafir' },
      { id: 'cala', kind: 'treasure', x: 86, y: 30, connects: ['faro_viejo'], gold: 25 }
    ]
  },
  {
    id: 'ruinas_veloran',
    regionId: 'ruinas_veloran',
    danger: 3,
    suggestedLevel: 5,
    monsterPool: ['sombra_menor'],
    nodes: [
      { id: 'entrada', kind: 'start', x: 14, y: 72, connects: ['columnas'] },
      { id: 'columnas', kind: 'event', x: 30, y: 56, connects: ['entrada', 'cripta', 'veta'] },
      { id: 'cripta', kind: 'combat', x: 46, y: 72, connects: ['columnas', 'galeria'], enemyId: 'sombra_menor' },
      { id: 'veta', kind: 'gather', x: 38, y: 32, connects: ['columnas', 'galeria'], itemId: 'mineral_hierro' },
      { id: 'galeria', kind: 'combat', x: 62, y: 52, connects: ['cripta', 'veta', 'altar_roto', 'camara'], enemyId: 'sombra_menor' },
      { id: 'altar_roto', kind: 'rest', x: 70, y: 28, connects: ['galeria', 'nucleo'] },
      { id: 'camara', kind: 'treasure', x: 82, y: 64, connects: ['galeria', 'nucleo'], gold: 30 },
      { id: 'nucleo', kind: 'combat', x: 90, y: 36, connects: ['altar_roto', 'camara'], enemyId: 'espectro_velo' }
    ]
  }
];

export function zoneById(id: string): ZoneDef {
  const z = ZONES.find((z) => z.id === id);
  if (!z) throw new Error(`Zona desconocida: ${id}`);
  return z;
}

export function zoneForRegion(regionId: string): ZoneDef | null {
  return ZONES.find((z) => z.regionId === regionId) ?? null;
}

/* ── Helpers de progreso (flags del mundo) ── */

export function nodeExploredFlag(zoneId: string, nodeId: string): string {
  return `zn_${zoneId}_${nodeId}`;
}

export function exploredNodes(zone: ZoneDef, flags: Record<string, unknown>): string[] {
  return zone.nodes.filter((n) => n.kind === 'start' || Boolean(flags[nodeExploredFlag(zone.id, n.id)])).map((n) => n.id);
}

export function zoneCompletion(zone: ZoneDef, flags: Record<string, unknown>): number {
  return Math.round((exploredNodes(zone, flags).length / zone.nodes.length) * 100);
}

/** Un nodo es accesible si conecta con alguno ya explorado. */
export function reachableNodes(zone: ZoneDef, flags: Record<string, unknown>): string[] {
  const explored = new Set(exploredNodes(zone, flags));
  return zone.nodes
    .filter((n) => !explored.has(n.id) && n.connects.some((c) => explored.has(c)))
    .map((n) => n.id);
}

export function killCounterFlag(enemyId: string): string {
  return `kills_${enemyId}`;
}
