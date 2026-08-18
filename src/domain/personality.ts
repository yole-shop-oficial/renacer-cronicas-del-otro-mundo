/**
 * PERSONALIDAD (§27-28) — los rasgos nacen de las decisiones.
 * Las acciones los modifican (efecto changeTrait) y ellos modifican
 * el combate: desbloquean acciones únicas (§28).
 */

export const TRAITS = [
  'compassion',   // Compasión
  'ambition',     // Ambición
  'prudence',     // Prudencia
  'courage',      // Valentía
  'curiosity',    // Curiosidad
  'distrust',     // Desconfianza
  'loyalty',      // Lealtad
  'sarcasm',      // Sarcasmo
  'patience',     // Paciencia
  'selfishness'   // Egoísmo
] as const;
export type TraitId = (typeof TRAITS)[number];

export type Personality = Partial<Record<TraitId, number>>;

export function traitValue(p: Personality | undefined, trait: TraitId): number {
  return p?.[trait] ?? 0;
}

export function addTrait(p: Personality | undefined, trait: TraitId, amount: number): Personality {
  const next = { ...(p ?? {}) };
  next[trait] = Math.max(-10, Math.min(10, (next[trait] ?? 0) + amount));
  return next;
}

/** Rasgo dominante (para diálogos futuros y el Diario). */
export function dominantTrait(p: Personality | undefined): TraitId | null {
  if (!p) return null;
  let best: TraitId | null = null;
  let bestV = 0;
  for (const t of TRAITS) {
    const v = p[t] ?? 0;
    if (v > bestV) { bestV = v; best = t; }
  }
  return bestV >= 2 ? best : null;
}

/**
 * Desbloqueos de combate por personalidad (§28):
 *  Valentía ≥3  → Furia
 *  Prudencia ≥3 → Defensa perfecta
 *  Curiosidad ≥3→ Análisis avanzado
 *  Compasión ≥3 → Salvar (perdonar la vida y terminar el combate)
 */
export const TRAIT_COMBAT_UNLOCKS: { trait: TraitId; min: number; actionId: string }[] = [
  { trait: 'courage', min: 3, actionId: 'furia' },
  { trait: 'prudence', min: 3, actionId: 'perfect_defense' },
  { trait: 'curiosity', min: 3, actionId: 'advanced_analysis' },
  { trait: 'compassion', min: 3, actionId: 'spare_life' }
];
