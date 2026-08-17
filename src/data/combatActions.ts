import type { CombatAction } from '@/combat/types';

/**
 * ACCIONES DE COMBATE (§9) — data-driven por clase.
 * Cada habilidad narrativa que sea combativa tiene aquí su versión táctica.
 */

export const COMBAT_ACTIONS: CombatAction[] = [
  // ── Universales ──
  { id: 'basic_attack', kind: 'attack', element: 'physical', mpCost: 0, staminaCost: 6, cooldownMs: 1200, castMs: 0, basePower: 10 },
  { id: 'defend', kind: 'defend', element: 'physical', mpCost: 0, staminaCost: 4, cooldownMs: 3000, castMs: 0, basePower: 0 },
  { id: 'analyze_combat', kind: 'analyze', element: 'physical', mpCost: 2, staminaCost: 0, cooldownMs: 4000, castMs: 0, basePower: 0 },
  { id: 'use_potion', kind: 'item', element: 'physical', mpCost: 0, staminaCost: 0, cooldownMs: 5000, castMs: 0, basePower: 0 },
  // ── Guerrero ──
  { id: 'power_strike', kind: 'skill', element: 'physical', mpCost: 4, staminaCost: 10, cooldownMs: 5000, castMs: 0, basePower: 22 },
  { id: 'war_cry', kind: 'skill', element: 'physical', mpCost: 6, staminaCost: 6, cooldownMs: 12000, castMs: 0, basePower: 0, selfApplies: { effect: 'haste', durationMs: 6000, power: 1 }, interrupts: true },
  { id: 'berserk', kind: 'skill', element: 'physical', mpCost: 10, staminaCost: 14, cooldownMs: 20000, castMs: 0, basePower: 34, selfApplies: { effect: 'weaken', durationMs: 4000, power: 1 } },
  // ── Caballero ──
  { id: 'shield_guard', kind: 'skill', element: 'physical', mpCost: 3, staminaCost: 6, cooldownMs: 8000, castMs: 0, basePower: 0, selfApplies: { effect: 'barrier', durationMs: 5000, power: 70 } },
  { id: 'shield_bash', kind: 'skill', element: 'physical', mpCost: 5, staminaCost: 9, cooldownMs: 9000, castMs: 0, basePower: 14, applies: { effect: 'stun', chance: 0.45, durationMs: 2200, power: 1 }, interrupts: true },
  { id: 'rally', kind: 'skill', element: 'light', mpCost: 8, staminaCost: 4, cooldownMs: 15000, castMs: 0, basePower: 0, selfApplies: { effect: 'regen', durationMs: 8000, power: 5 } },
  // ── Mago ──
  { id: 'fireball', kind: 'spell', element: 'fire', mpCost: 8, staminaCost: 0, cooldownMs: 4000, castMs: 800, basePower: 24, applies: { effect: 'burn', chance: 0.5, durationMs: 5000, power: 4 } },
  { id: 'arcane_missile', kind: 'spell', element: 'light', mpCost: 5, staminaCost: 0, cooldownMs: 2500, castMs: 0, basePower: 14 },
  { id: 'meteor', kind: 'spell', element: 'fire', mpCost: 20, staminaCost: 0, cooldownMs: 25000, castMs: 4000, basePower: 60, applies: { effect: 'burn', chance: 0.8, durationMs: 6000, power: 6 } },
  { id: 'clarity', kind: 'spell', element: 'water', mpCost: 0, staminaCost: 6, cooldownMs: 14000, castMs: 0, basePower: 0, selfApplies: { effect: 'regen', durationMs: 6000, power: 4 } },
  // ── Arquero ──
  { id: 'precise_shot', kind: 'skill', element: 'physical', mpCost: 4, staminaCost: 8, cooldownMs: 4500, castMs: 0, basePower: 20 },
  { id: 'double_shot', kind: 'skill', element: 'physical', mpCost: 7, staminaCost: 12, cooldownMs: 8000, castMs: 0, basePower: 28 },
  { id: 'hunters_mark', kind: 'skill', element: 'physical', mpCost: 6, staminaCost: 4, cooldownMs: 12000, castMs: 0, basePower: 0, applies: { effect: 'weaken', chance: 1, durationMs: 8000, power: 2 } },
  // ── Sacerdote ──
  { id: 'heal', kind: 'spell', element: 'light', mpCost: 8, staminaCost: 0, cooldownMs: 6000, castMs: 600, basePower: 0, selfApplies: { effect: 'regen', durationMs: 5000, power: 8 } },
  { id: 'blessing', kind: 'spell', element: 'light', mpCost: 6, staminaCost: 0, cooldownMs: 10000, castMs: 0, basePower: 0, selfApplies: { effect: 'barrier', durationMs: 6000, power: 40 } },
  { id: 'sanctuary', kind: 'spell', element: 'light', mpCost: 14, staminaCost: 0, cooldownMs: 20000, castMs: 1500, basePower: 18 },
  // ── Pícaro ──
  { id: 'shadow_strike', kind: 'skill', element: 'dark', mpCost: 6, staminaCost: 10, cooldownMs: 7000, castMs: 0, basePower: 26 },
  { id: 'poison_blade', kind: 'skill', element: 'poison', mpCost: 5, staminaCost: 8, cooldownMs: 9000, castMs: 0, basePower: 12, applies: { effect: 'poisoned', chance: 0.85, durationMs: 8000, power: 4 } },
  { id: 'vanish', kind: 'skill', element: 'dark', mpCost: 8, staminaCost: 6, cooldownMs: 16000, castMs: 0, basePower: 0, selfApplies: { effect: 'haste', durationMs: 5000, power: 1 } },
  // ── Invocador ──
  { id: 'summon_wisp', kind: 'spell', element: 'light', mpCost: 10, staminaCost: 0, cooldownMs: 12000, castMs: 1000, basePower: 18 },
  { id: 'summon_sprite', kind: 'spell', element: 'wind', mpCost: 9, staminaCost: 0, cooldownMs: 10000, castMs: 800, basePower: 16 },
  { id: 'soul_link', kind: 'spell', element: 'dark', mpCost: 12, staminaCost: 0, cooldownMs: 18000, castMs: 0, basePower: 0, selfApplies: { effect: 'regen', durationMs: 10000, power: 4 } },
  // ── Aventurero ──
  { id: 'improvise', kind: 'skill', element: 'physical', mpCost: 3, staminaCost: 7, cooldownMs: 6000, castMs: 0, basePower: 16 },
  { id: 'lucky_break', kind: 'skill', element: 'physical', mpCost: 5, staminaCost: 5, cooldownMs: 11000, castMs: 0, basePower: 12, applies: { effect: 'stun', chance: 0.3, durationMs: 2000, power: 1 }, interrupts: true },
  // ── Reacciones contextuales (§64) ──
  { id: 'dodge', kind: 'dodge', element: 'physical', mpCost: 0, staminaCost: 8, cooldownMs: 2000, castMs: 0, basePower: 0, reactionOnly: true },
  { id: 'counterspell', kind: 'reaction', element: 'light', mpCost: 6, staminaCost: 0, cooldownMs: 6000, castMs: 0, basePower: 0, reactionOnly: true, interrupts: true }
];

export function actionById(id: string): CombatAction | undefined {
  return COMBAT_ACTIONS.find((a) => a.id === id);
}

/** Acciones disponibles para un personaje (universales + sus habilidades). */
export function actionsForCharacter(skills: string[]): CombatAction[] {
  const universal = ['basic_attack', 'defend', 'analyze_combat', 'use_potion'];
  return COMBAT_ACTIONS.filter(
    (a) => !a.reactionOnly && (universal.includes(a.id) || skills.includes(a.id))
  );
}
