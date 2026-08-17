import type { Element, StatusEffect } from './types';

/**
 * COMBOS COOPERATIVOS (§42, §67) — data-driven.
 * Se descubren experimentando: dos elementos lanzados en la misma
 * ventana de tiempo crean un efecto que ninguno logra solo.
 */

export interface ComboRule {
  id: string;
  elements: [Element, Element];
  bonusDamage: number;
  applies?: { effect: StatusEffect; durationMs: number; power: number };
  text: Record<string, string>;
}

export const COMBO_RULES: ComboRule[] = [
  {
    id: 'combo_firestorm',
    elements: ['fire', 'wind'],
    bonusDamage: 34,
    applies: { effect: 'burn', durationMs: 6000, power: 6 },
    text: { es: '¡COMBO! Vuestras magias se trenzan: un tornado de fuego devora el aire.', en: 'COMBO! Your magics entwine: a tornado of fire devours the air.' }
  },
  {
    id: 'combo_frozen_field',
    elements: ['ice', 'lightning'],
    bonusDamage: 28,
    applies: { effect: 'stun', durationMs: 3000, power: 1 },
    text: { es: '¡COMBO! Un campo de escarcha eléctrica paraliza a la criatura.', en: 'COMBO! A field of electric frost paralyzes the creature.' }
  },
  {
    id: 'combo_steam_veil',
    elements: ['fire', 'water'],
    bonusDamage: 22,
    applies: { effect: 'blind', durationMs: 4000, power: 1 },
    text: { es: '¡COMBO! Un velo de vapor ciega al enemigo.', en: 'COMBO! A veil of steam blinds the enemy.' }
  },
  {
    id: 'combo_mudbind',
    elements: ['water', 'earth'],
    bonusDamage: 20,
    applies: { effect: 'weaken', durationMs: 5000, power: 2 },
    text: { es: '¡COMBO! El barro atrapa sus patas: la criatura se debilita.', en: 'COMBO! The mud traps its limbs: the creature weakens.' }
  },
  {
    id: 'combo_radiant_edge',
    elements: ['light', 'physical'],
    bonusDamage: 30,
    text: { es: '¡COMBO! El filo bendecido corta la oscuridad misma.', en: 'COMBO! The blessed edge cuts through darkness itself.' }
  },
  {
    id: 'combo_storm',
    elements: ['wind', 'lightning'],
    bonusDamage: 32,
    text: { es: '¡COMBO! Una tormenta eléctrica ruge sobre el campo.', en: 'COMBO! An electric storm roars over the field.' }
  }
];

/** Ventana en ms para encadenar un combo con la acción del compañero. */
export const COMBO_WINDOW_MS = 4000;
