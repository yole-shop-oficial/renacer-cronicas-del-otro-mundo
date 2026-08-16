/**
 * DOMINIO — Tipos centrales del juego.
 * Independiente de UI, persistencia y red (regla de arquitectura §53).
 */

/** Estadísticas principales (§15). Sistema extensible: un registro de claves. */
export const PRIMARY_STATS = [
  'strength',
  'intelligence',
  'agility',
  'vitality',
  'luck',
  'willpower',
  'charisma'
] as const;
export type PrimaryStat = (typeof PRIMARY_STATS)[number];

/** Estadísticas derivadas (§15), calculadas — nunca almacenadas a mano. */
export const DERIVED_STATS = [
  'hp',
  'mp',
  'stamina',
  'attack',
  'defense',
  'crit',
  'speed',
  'resistance',
  'magicPower'
] as const;
export type DerivedStat = (typeof DERIVED_STATS)[number];

export type StatBlock = Record<PrimaryStat, number>;
export type DerivedBlock = Record<DerivedStat, number>;

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';

/** Slots de equipamiento del personaje. */
export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'accessory'] as const;
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];
export type Equipment = Partial<Record<EquipmentSlot, string>>;

export type ItemType =
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'material'
  | 'magic'
  | 'quest'
  | 'unique'
  | 'hidden';

export interface ItemDef {
  id: string;
  type: ItemType;
  rarity: Rarity;
  /** Si el objeto es equipable, en qué slot va. */
  slot?: EquipmentSlot;
  stats?: Partial<StatBlock>;
  effects?: { restoreHp?: number; restoreMp?: number; grantFlag?: string };
  value: number;
  restrictions?: { minLevel?: number; classIds?: string[] };
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
  equipped?: boolean;
}

export interface SkillDef {
  id: string;
  classIds: string[] | 'all';
  mpCost: number;
  /** Habilidades narrativas: desbloquean opciones de diálogo/eventos (§16). */
  narrativeTags: string[];
}

export interface ClassDef {
  id: string;
  baseStats: Partial<StatBlock>;
  startingSkills: string[];
  startingItems: string[];
  /** El motor admite clases avanzadas/ocultas más adelante (§13). */
  tier: 'base' | 'advanced' | 'hidden' | 'legendary';
}

export interface GoddessDef {
  id: string;
  blessing: { stat: PrimaryStat; bonus: number };
  grantsSkill?: string;
  narrativeTags: string[];
}

export interface CharacterTemplate {
  id: string;
  defaultName: string;
  /** Género gramatical del personaje: afecta a los textos narrativos. */
  gender: 'f' | 'm';
  baseStats: StatBlock;
  talents: string[];
  narrativeTags: string[];
}

export const RELATIONSHIP_AXES = [
  'trust',
  'friendship',
  'respect',
  'fear',
  'affection',
  'rivalry'
] as const;
export type RelationshipAxis = (typeof RELATIONSHIP_AXES)[number];
export type RelationshipBlock = Record<RelationshipAxis, number>;

export interface NpcDef {
  id: string;
  regionId: string;
  profession: string;
  age: number;
  /**
   * Estadística que este NPC potencia mediante el vínculo (§sistema de
   * vínculos): a mayor vínculo positivo, más bonificación otorga.
   */
  bondStat: PrimaryStat;
  initialRelationships: Partial<RelationshipBlock>;
}

export interface RegionDef {
  id: string;
  kind: 'village' | 'forest' | 'city' | 'ruins' | 'temple' | 'unknown';
  connectedTo: string[];
  discoveredByDefault: boolean;
}

export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';

export interface QuestState {
  questId: string;
  status: QuestStatus;
  progress: Record<string, number>;
}

/** Estado vivo del personaje del jugador. */
export interface CharacterState {
  id: string;
  templateId: string;
  name: string;
  gender: 'f' | 'm';
  classId: string;
  goddessId: string;
  level: number;
  xp: number;
  stats: StatBlock;
  /** Puntos de atributo sin gastar: +10 por nivel. */
  unspentPoints: number;
  /** Puntos de habilidad para el árbol: +1 por nivel. */
  skillPoints: number;
  /** Nodos del árbol de habilidades ya aprendidos. */
  treeNodes: string[];
  currentHp: number;
  currentMp: number;
  skills: string[];
  inventory: InventoryEntry[];
  /** Objetos equipados por slot (arma / armadura / accesorio). */
  equipment: Equipment;
  gold: number;
  titles: string[];
  reputation: Record<string, number>;
}

/** Estado vivo del mundo: flags globales + memoria de decisiones (§64-65). */
export interface WorldState {
  flags: Record<string, boolean | number | string>;
  discoveredRegions: string[];
  currentRegionId: string;
  npcRelationships: Record<string, RelationshipBlock>;
  npcMemory: Record<string, string[]>;
  quests: QuestState[];
  /** Event sourcing de decisiones: IDs únicos, nunca se duplican (§31). */
  decisions: { id: string; nodeId: string; choiceId: string; at: number }[];
}

export interface GameSave {
  gameId: string;
  characterId: string;
  currentNodeId: string;
  character: CharacterState;
  world: WorldState;
  updatedAt: number;
  schemaVersion: number;
}
