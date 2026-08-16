import type { DerivedBlock, StatBlock } from './types';

/**
 * Sistema de estadísticas derivadas (§15).
 * Fórmulas centralizadas: ningún otro módulo debe recalcular esto.
 */
export function deriveStats(stats: StatBlock, level: number): DerivedBlock {
  return {
    hp: 50 + stats.vitality * 8 + level * 10,
    mp: 20 + stats.intelligence * 5 + stats.willpower * 3 + level * 5,
    stamina: 30 + stats.vitality * 3 + stats.agility * 2,
    attack: stats.strength * 2 + Math.floor(stats.agility / 2),
    defense: stats.vitality * 2 + Math.floor(stats.strength / 2),
    crit: 5 + Math.floor(stats.luck / 2) + Math.floor(stats.agility / 4),
    speed: stats.agility * 2,
    resistance: stats.willpower * 2 + Math.floor(stats.vitality / 2),
    magicPower: stats.intelligence * 2 + Math.floor(stats.willpower / 2)
  };
}

/** XP necesaria para subir del nivel `level` al siguiente. Curva suave. */
export function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Aplica XP y devuelve el nuevo estado de nivel/xp.
 * Idempotencia: el llamador debe deduplicar por decisión (ver sync §31).
 */
export function applyXp(level: number, xp: number, gained: number) {
  let newLevel = level;
  let newXp = xp + gained;
  let leveledUp = false;
  while (newXp >= xpForNextLevel(newLevel)) {
    newXp -= xpForNextLevel(newLevel);
    newLevel += 1;
    leveledUp = true;
  }
  return { level: newLevel, xp: newXp, leveledUp };
}

export function mergeStats(base: StatBlock, bonus: Partial<StatBlock>): StatBlock {
  const out = { ...base };
  for (const [k, v] of Object.entries(bonus)) {
    out[k as keyof StatBlock] += v ?? 0;
  }
  return out;
}
