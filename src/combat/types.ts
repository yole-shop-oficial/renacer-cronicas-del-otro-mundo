/**
 * COMBAT ENGINE — Tipos (§6-22 de Instrucciones).
 * Separado del Story Engine (§86); se comunican por eventos (§87).
 * Combate táctico en tiempo real por comandos: sin 3D, sin joystick.
 */

/** Elementos mágicos (§10) — extensibles. */
export const ELEMENTS = [
  'physical',
  'fire',
  'water',
  'wind',
  'earth',
  'light',
  'dark',
  'ice',
  'lightning',
  'poison'
] as const;
export type Element = (typeof ELEMENTS)[number];

/** Efectos de estado (§12). */
export const STATUS_EFFECTS = [
  'burn',
  'freeze',
  'poisoned',
  'bleed',
  'stun',
  'blind',
  'silence',
  'fear',
  'weaken',
  'haste',
  'regen',
  'barrier',
  'wet',
  'oiled',
  'taunted'
] as const;
export type StatusEffect = (typeof STATUS_EFFECTS)[number];

export interface ActiveStatus {
  effect: StatusEffect;
  /** Milisegundos restantes. */
  remainingMs: number;
  /** Potencia (daño por tick, % de reducción, etc.). */
  power: number;
}

/** Acción de combate (§9): comando que el jugador puede tocar. */
export interface CombatAction {
  id: string;
  kind: 'attack' | 'skill' | 'spell' | 'item' | 'defend' | 'dodge' | 'analyze' | 'flee' | 'reaction';
  element: Element;
  mpCost: number;
  staminaCost: number;
  /** Cooldown en ms (§7). */
  cooldownMs: number;
  /** Tiempo de canalización en ms; 0 = instantáneo (§16). */
  castMs: number;
  /** Daño base (se escala con stats). 0 para utilidades. */
  basePower: number;
  /** Estado que aplica al objetivo (con probabilidad 0-1). */
  applies?: { effect: StatusEffect; chance: number; durationMs: number; power: number };
  /** Estado que se aplica a uno mismo. */
  selfApplies?: { effect: StatusEffect; durationMs: number; power: number };
  /** Puede interrumpir canalizaciones enemigas (§17). */
  interrupts?: boolean;
  /** Solo disponible como reacción en ventanas de peligro (§64). */
  reactionOnly?: boolean;
}

/** Patrón de ataque enemigo: telegrafiado con ventana de reacción (§5, §8). */
export interface EnemyMove {
  id: string;
  /** Texto narrativo del telegrafiado (ES/EN). */
  telegraph: Record<string, string>;
  /** Texto del impacto. */
  impact: Record<string, string>;
  element: Element;
  power: number;
  /** Ventana de reacción en ms antes del impacto (§65: generosa, se puede leer). */
  windowMs: number;
  /** Reacciones correctas que lo evitan/mitigan. */
  counters: ('defend' | 'dodge' | 'interrupt' | 'counterspell')[];
  applies?: { effect: StatusEffect; chance: number; durationMs: number; power: number };
}

/** Definición de enemigo (§13): personalidad, no barra de vida. */
export interface EnemyDef {
  id: string;
  maxHp: number;
  /** Debilidades y resistencias elementales (§11). */
  weaknesses: Element[];
  resistances: Element[];
  moves: EnemyMove[];
  /** Cadencia entre acciones enemigas (ms). */
  paceMs: number;
  /** Lo que revela Analizar, por nivel de análisis (§15). */
  analyzeReveals: Record<string, string>[];
  /** Fases de jefe (§14): umbral de HP (0-1) → cambia moves/pace. */
  phases?: { hpBelow: number; moves: EnemyMove[]; paceMs: number; entryText: Record<string, string> }[];
  /** Recompensas y consecuencias narrativas (§20). */
  rewards: { xp: number; gold: number; items?: { itemId: string; qty: number }[] };
}

/** Estado vivo de un combate. */
export interface CombatState {
  enemyId: string;
  enemyHp: number;
  enemyMaxHp: number;
  enemyStatuses: ActiveStatus[];
  currentPhase: number;
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  playerStamina: number;
  playerMaxStamina: number;
  playerStatuses: ActiveStatus[];
  cooldowns: Record<string, number>;
  /** Canalización en curso del jugador. */
  casting: { actionId: string; remainingMs: number } | null;
  /** Ataque enemigo telegrafiado esperando reacción. */
  incoming: { moveId: string; remainingMs: number } | null;
  /** Registro narrativo del combate (§19). */
  log: CombatLogEntry[];
  phase: 'intro' | 'active' | 'victory' | 'defeat' | 'fled';
  analyzeLevel: number;
}

export interface CombatLogEntry {
  /** Clave i18n o texto localizado directo. */
  text: Record<string, string>;
  /** Daño mostrado junto al texto (§19: número + narración). */
  amount?: number;
  tone: 'player' | 'enemy' | 'status' | 'system' | 'combo';
  at: number;
}

/** Eventos que el Combat Engine emite hacia la historia (§87). */
export type CombatEvent =
  | { type: 'COMBAT_STARTED'; enemyId: string }
  | { type: 'PLAYER_USED_ACTION'; actionId: string }
  | { type: 'ENEMY_PHASE_CHANGED'; phase: number }
  | { type: 'COMBO_TRIGGERED'; comboId: string }
  | { type: 'COMBAT_WON'; enemyId: string }
  | { type: 'COMBAT_LOST'; enemyId: string }
  | { type: 'COMBAT_FLED'; enemyId: string };
