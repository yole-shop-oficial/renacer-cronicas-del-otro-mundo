import type { Condition } from './schema';
import type { CharacterState, WorldState, RelationshipAxis, PrimaryStat } from '@/domain/types';

/**
 * Evaluador de condiciones del motor narrativo (§22).
 * Puro y sin efectos: fácil de testear.
 */
export function evaluateCondition(
  c: Condition,
  character: CharacterState,
  world: WorldState
): boolean {
  switch (c.kind) {
    case 'stat': {
      const actual = character.stats[c.key as PrimaryStat] ?? 0;
      return compare(actual, c.op, Number(c.value ?? 0));
    }
    case 'skill':
      return negate(c.op, character.skills.includes(c.key));
    case 'item':
      return negate(
        c.op,
        character.inventory.some((e) => e.itemId === c.key && e.quantity > 0)
      );
    case 'flag': {
      const flag = world.flags[c.key];
      if (c.value === undefined) return negate(c.op, Boolean(flag));
      return compare(flag as never, c.op, c.value as never);
    }
    case 'relationship': {
      const rel = world.npcRelationships[c.target ?? c.key];
      const actual = rel?.[(c.axis ?? 'trust') as RelationshipAxis] ?? 0;
      return compare(actual, c.op, Number(c.value ?? 0));
    }
    case 'class':
      return negate(c.op, character.classId === c.key);
    case 'goddess':
      return negate(c.op, character.goddessId === c.key);
    case 'quest': {
      const q = world.quests.find((q) => q.questId === (c.target ?? c.key));
      return negate(c.op, q?.status === (c.value ?? 'completed'));
    }
    case 'decision':
      return negate(
        c.op,
        world.decisions.some((d) => d.choiceId === c.key || d.nodeId === c.key)
      );
  }
}

export function evaluateAll(
  conditions: Condition[],
  character: CharacterState,
  world: WorldState
): boolean {
  return conditions.every((c) => evaluateCondition(c, character, world));
}

function compare(actual: number | string | boolean, op: Condition['op'], expected: number | string | boolean): boolean {
  switch (op) {
    case '>=':
      return Number(actual) >= Number(expected);
    case '<=':
      return Number(actual) <= Number(expected);
    case '==':
      return actual === expected;
    case '!=':
      return actual !== expected;
    case 'has':
      return Boolean(actual);
    case 'not':
      return !actual;
  }
}

function negate(op: Condition['op'], result: boolean): boolean {
  return op === 'not' || op === '!=' ? !result : result;
}
