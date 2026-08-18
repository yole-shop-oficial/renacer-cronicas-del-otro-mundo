import type { Effect } from '@/engine/schema';

/**
 * DIVISIÓN DE TAREAS SIMULTÁNEAS (§45).
 * Un evento de tareas divididas ofrece DOS tareas que ocurren A LA VEZ:
 *  - Tarea A: un combate (la distracción, la defensa...).
 *  - Tarea B: un minijuego de pulsos cronometrados (abrir la barrera,
 *    cortar amarras, descifrar el sello...).
 *
 * EN PAREJA: cada alma toma una tarea distinta (negociada por mensajes);
 * ambas corren en paralelo y al terminar los RESULTADOS SE FUNDEN:
 * el nodo de resolución depende de la combinación (éxito/fallo de cada una).
 *
 * EN SOLITARIO: se viven en secuencia (primero B contrarreloj, luego A),
 * con el mismo esquema de resolución — nadie queda bloqueado (§35).
 */

export interface SplitTaskDef {
  id: string;
  /** Tarea A: combate. */
  combatId: string;
  /** Tarea B: pulsos cronometrados. */
  ritual: {
    /** Pulsos necesarios para completar. */
    steps: number;
    /** Ventana por pulso (ms): tocar cuando el anillo está en la zona. */
    windowMs: number;
    /** Fallos permitidos antes de fracasar. */
    maxMisses: number;
  };
  /** Nodo de resolución por combinación (combate, ritual). */
  outcomes: {
    bothWin: string;
    combatOnly: string;
    ritualOnly: string;
    bothFail: string;
  };
  /** Efectos extra si ambos triunfan (el broche §45). */
  bothWinEffects: Effect[];
}

export const SPLIT_TASKS: SplitTaskDef[] = [
  {
    id: 'zafir_harbor_split',
    combatId: 'corsario_zafir',
    ritual: { steps: 5, windowMs: 1400, maxMisses: 2 },
    outcomes: {
      bothWin: 'c5_both_win',
      combatOnly: 'c5_combat_only',
      ritualOnly: 'c5_ritual_only',
      bothFail: 'c5_both_fail'
    },
    bothWinEffects: [
      { kind: 'gainXp', amount: 40 },
      { kind: 'grantTitle', key: 'harbor_breaker' },
      { kind: 'setFlag', key: 'zafir_perfect_run', value: true }
    ]
  }
];

export function splitTaskById(id: string): SplitTaskDef {
  const t = SPLIT_TASKS.find((t) => t.id === id);
  if (!t) throw new Error(`Tarea dividida desconocida: ${id}`);
  return t;
}

export type SplitRole = 'combat' | 'ritual';

/** Estado del ritual de pulsos (tarea B) — reductor puro y testeable. */
export interface RitualState {
  step: number;
  misses: number;
  phase: 'active' | 'success' | 'failed';
}

export function createRitual(): RitualState {
  return { step: 0, misses: 0, phase: 'active' };
}

export function ritualPulse(
  state: RitualState,
  hit: boolean,
  def: SplitTaskDef['ritual']
): RitualState {
  if (state.phase !== 'active') return state;
  const s = { ...state };
  if (hit) {
    s.step += 1;
    if (s.step >= def.steps) s.phase = 'success';
  } else {
    s.misses += 1;
    if (s.misses > def.maxMisses) s.phase = 'failed';
  }
  return s;
}

/** Resolución combinada: la fusión de ambos resultados (§45). */
export function resolveSplit(
  def: SplitTaskDef,
  combatWon: boolean,
  ritualWon: boolean
): string {
  if (combatWon && ritualWon) return def.outcomes.bothWin;
  if (combatWon) return def.outcomes.combatOnly;
  if (ritualWon) return def.outcomes.ritualOnly;
  return def.outcomes.bothFail;
}
