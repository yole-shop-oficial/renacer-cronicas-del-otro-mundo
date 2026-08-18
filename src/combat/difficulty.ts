/**
 * DIFICULTAD (§108): Historia / Normal / Difícil.
 * Historia no es trivial: reduce daño y alarga ventanas, pero el
 * jugador sigue teniendo que leer, pensar y reaccionar (§73).
 */

export type Difficulty = 'story' | 'normal' | 'hard';

let current: Difficulty =
  typeof localStorage !== 'undefined'
    ? ((localStorage.getItem('difficulty') as Difficulty) ?? 'normal')
    : 'normal';

export function getDifficulty(): Difficulty {
  return current;
}

export function setDifficulty(d: Difficulty): void {
  current = d;
  if (typeof localStorage !== 'undefined') localStorage.setItem('difficulty', d);
}

/** Multiplicador del daño enemigo. */
export function enemyDamageMult(): number {
  return current === 'story' ? 0.65 : current === 'hard' ? 1.3 : 1;
}

/** Multiplicador de las ventanas de reacción. */
export function reactionWindowMult(): number {
  return current === 'story' ? 1.35 : current === 'hard' ? 0.8 : 1;
}
