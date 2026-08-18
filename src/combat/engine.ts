import type {
  ActiveStatus,
  CombatAction,
  CombatEvent,
  CombatState,
  Element,
  EnemyDef,
  EnemyMove,
  StatusEffect
} from './types';
import { getEnemy } from '@/data/enemies';
import { COMBO_RULES } from './combos';
import { enemyDamageMult, reactionWindowMult } from './difficulty';

/**
 * COMBAT ENGINE (§6-22) — reductor puro por ticks.
 * - tick(state, dt): avanza cooldowns, casts, estados y la IA enemiga.
 * - act(state, action): aplica un comando del jugador.
 * - react(state, reaction): resuelve una ventana de reacción.
 * Determinista salvo RNG inyectable → sincronizable entre dos almas
 * (autoridad del host, §69) y fácil de testear (§89).
 */

export type Rng = () => number;

export interface TickResult {
  state: CombatState;
  events: CombatEvent[];
}

const STATUS_TICK_MS = 1000;

export function createCombat(
  enemyId: string,
  player: { hp: number; maxHp: number; mp: number; maxMp: number; stamina: number },
  locale2: (r: Record<string, string>) => Record<string, string> = (r) => r
): CombatState {
  const enemy = getEnemy(enemyId);
  return {
    enemyId,
    enemyHp: enemy.maxHp,
    enemyMaxHp: enemy.maxHp,
    enemyStatuses: [],
    currentPhase: 0,
    playerHp: player.hp,
    playerMaxHp: player.maxHp,
    playerMp: player.mp,
    playerMaxMp: player.maxMp,
    playerStamina: player.stamina,
    playerMaxStamina: player.stamina,
    playerStatuses: [],
    cooldowns: {},
    casting: null,
    incoming: null,
    log: [
      {
        text: locale2({ es: 'El encuentro comienza.', en: 'The encounter begins.' }),
        tone: 'system',
        at: 0
      }
    ],
    phase: 'active',
    analyzeLevel: 0
  };
}

function currentMoves(state: CombatState, enemy: EnemyDef): { moves: EnemyMove[]; paceMs: number } {
  if (enemy.phases) {
    const ratio = state.enemyHp / state.enemyMaxHp;
    for (let i = enemy.phases.length - 1; i >= 0; i--) {
      if (ratio < enemy.phases[i].hpBelow) {
        return { moves: enemy.phases[i].moves, paceMs: enemy.phases[i].paceMs };
      }
    }
  }
  return { moves: enemy.moves, paceMs: enemy.paceMs };
}

function hasStatus(list: ActiveStatus[], effect: StatusEffect): boolean {
  return list.some((s) => s.effect === effect && s.remainingMs > 0);
}

function addStatus(list: ActiveStatus[], effect: StatusEffect, durationMs: number, power: number): ActiveStatus[] {
  const existing = list.find((s) => s.effect === effect);
  if (existing) {
    existing.remainingMs = Math.max(existing.remainingMs, durationMs);
    existing.power = Math.max(existing.power, power);
    return list;
  }
  return [...list, { effect, remainingMs: durationMs, power }];
}

/** Multiplicador elemental (§11): debilidad ×1.6, resistencia ×0.5. */
function elementMultiplier(element: Element, enemy: EnemyDef): number {
  if (enemy.weaknesses.includes(element)) return 1.6;
  if (enemy.resistances.includes(element)) return 0.5;
  return 1;
}

/**
 * INTERACCIONES ELEMENTALES (§11): no solo números — crean situaciones.
 * fuego+oiled → explosión (bonus + quemadura fuerte)
 * fuego+freeze → descongela (quita freeze, daño normal)
 * lightning+wet → electrocución (bonus + stun)
 * ice+wet → congelación garantizada
 * wind+burn → aviva las llamas (extiende quemadura)
 */
function elementalInteraction(
  element: Element,
  targetStatuses: ActiveStatus[]
): { bonus: number; add?: { effect: StatusEffect; durationMs: number; power: number }; remove?: StatusEffect; text?: Record<string, string> } {
  if (element === 'fire' && hasStatus(targetStatuses, 'oiled')) {
    return {
      bonus: 1.8,
      add: { effect: 'burn', durationMs: 6000, power: 6 },
      remove: 'oiled',
      text: { es: '¡El aceite estalla en llamas!', en: 'The oil bursts into flame!' }
    };
  }
  if (element === 'fire' && hasStatus(targetStatuses, 'freeze')) {
    return {
      bonus: 1,
      remove: 'freeze',
      text: { es: 'El hielo se funde con un siseo.', en: 'The ice melts with a hiss.' }
    };
  }
  if (element === 'lightning' && hasStatus(targetStatuses, 'wet')) {
    return {
      bonus: 1.5,
      add: { effect: 'stun', durationMs: 2500, power: 1 },
      text: { es: '¡La corriente recorre el agua!', en: 'The current races through the water!' }
    };
  }
  if (element === 'ice' && hasStatus(targetStatuses, 'wet')) {
    return {
      bonus: 1.2,
      add: { effect: 'freeze', durationMs: 4000, power: 1 },
      remove: 'wet',
      text: { es: 'El agua se congela al instante.', en: 'The water freezes instantly.' }
    };
  }
  if (element === 'wind' && hasStatus(targetStatuses, 'burn')) {
    return {
      bonus: 1.3,
      add: { effect: 'burn', durationMs: 5000, power: 5 },
      text: { es: 'El viento aviva las llamas.', en: 'The wind fans the flames.' }
    };
  }
  return { bonus: 1 };
}

/** Aplica un comando del jugador (§9). */
export function act(
  state: CombatState,
  action: CombatAction,
  attackStat: number,
  magicStat: number,
  rng: Rng = Math.random
): TickResult {
  const s = structuredClone(state);
  const events: CombatEvent[] = [];
  if (s.phase !== 'active') return { state: s, events };
  if (hasStatus(s.playerStatuses, 'stun') || hasStatus(s.playerStatuses, 'freeze')) return { state: s, events };
  if (action.kind === 'spell' && hasStatus(s.playerStatuses, 'silence')) return { state: s, events };
  if ((s.cooldowns[action.id] ?? 0) > 0) return { state: s, events };
  if (s.playerMp < action.mpCost || s.playerStamina < action.staminaCost) return { state: s, events };
  if (s.casting) return { state: s, events }; // ya canalizando

  s.playerMp -= action.mpCost;
  s.playerStamina -= action.staminaCost;
  s.cooldowns[action.id] = action.cooldownMs;
  events.push({ type: 'PLAYER_USED_ACTION', actionId: action.id });

  if (action.castMs > 0) {
    // Hechizo de carga (§16): se resuelve al completar la canalización.
    s.casting = { actionId: action.id, remainingMs: action.castMs };
    s.log.push({
      text: { es: 'Comienzas a canalizar...', en: 'You begin to channel...' },
      tone: 'player',
      at: Date.now()
    });
    return { state: s, events };
  }

  return { state: resolvePlayerAction(s, action, attackStat, magicStat, rng), events };
}

function resolvePlayerAction(
  s: CombatState,
  action: CombatAction,
  attackStat: number,
  magicStat: number,
  rng: Rng
): CombatState {
  const enemy = getEnemy(s.enemyId);

  if (action.kind === 'defend') {
    s.playerStatuses = addStatus(s.playerStatuses, 'barrier', 2500, 60);
    s.log.push({ text: { es: 'Te pones en guardia.', en: 'You raise your guard.' }, tone: 'player', at: Date.now() });
    return s;
  }
  if (action.kind === 'analyze') {
    s.analyzeLevel = Math.min(s.analyzeLevel + 1, enemy.analyzeReveals.length);
    const reveal = enemy.analyzeReveals[s.analyzeLevel - 1];
    if (reveal) s.log.push({ text: reveal, tone: 'system', at: Date.now() });
    return s;
  }
  if (action.kind === 'dodge' || action.kind === 'flee') {
    // dodge fuera de ventana no hace nada; flee se resuelve en la UI/coordinador.
    return s;
  }

  const stat = action.kind === 'spell' ? magicStat : attackStat;
  const interaction = elementalInteraction(action.element, s.enemyStatuses);
  const mult = elementMultiplier(action.element, enemy) * interaction.bonus;
  const variance = 0.9 + rng() * 0.2;
  const damage = Math.max(1, Math.round((action.basePower + stat * 1.5) * mult * variance));

  if (action.basePower > 0) {
    s.enemyHp = Math.max(0, s.enemyHp - damage);
    s.log.push({
      text: interaction.text ?? { es: 'Tu golpe encuentra su marca.', en: 'Your strike finds its mark.' },
      amount: -damage,
      tone: interaction.bonus > 1 ? 'combo' : 'player',
      at: Date.now()
    });
  }

  if (interaction.remove) {
    s.enemyStatuses = s.enemyStatuses.filter((st) => st.effect !== interaction.remove);
  }
  if (interaction.add) {
    s.enemyStatuses = addStatus(s.enemyStatuses, interaction.add.effect, interaction.add.durationMs, interaction.add.power);
  }
  if (action.applies && rng() < action.applies.chance) {
    s.enemyStatuses = addStatus(s.enemyStatuses, action.applies.effect, action.applies.durationMs, action.applies.power);
    s.log.push({
      text: { es: `El enemigo sufre un nuevo estado.`, en: `The enemy suffers a new condition.` },
      tone: 'status',
      at: Date.now()
    });
  }
  if (action.selfApplies) {
    s.playerStatuses = addStatus(s.playerStatuses, action.selfApplies.effect, action.selfApplies.durationMs, action.selfApplies.power);
  }
  // Interrupción (§17): cancela el telegrafiado enemigo.
  if (action.interrupts && s.incoming) {
    s.incoming = null;
    s.log.push({ text: { es: '¡Interrumpes su ataque!', en: 'You interrupt its attack!' }, tone: 'combo', at: Date.now() });
  }
  return s;
}

/** Reacción del jugador en la ventana de peligro (§64). */
export function react(
  state: CombatState,
  reaction: 'defend' | 'dodge' | 'interrupt' | 'counterspell'
): TickResult {
  const s = structuredClone(state);
  const events: CombatEvent[] = [];
  if (!s.incoming || s.phase !== 'active') return { state: s, events };
  const enemy = getEnemy(s.enemyId);
  const { moves } = currentMoves(s, enemy);
  const move = moves.find((m) => m.id === s.incoming!.moveId) ?? enemy.moves.find((m) => m.id === s.incoming!.moveId);
  if (!move) return { state: s, events };

  if (move.counters.includes(reaction)) {
    s.incoming = null;
    s.log.push({
      text:
        reaction === 'dodge'
          ? { es: 'Te apartas en el último instante.', en: 'You slip aside at the last instant.' }
          : reaction === 'defend'
            ? { es: 'Tu guardia absorbe el impacto.', en: 'Your guard absorbs the blow.' }
            : { es: 'Rompes su ataque antes de que nazca.', en: 'You break its attack before it is born.' },
      tone: 'player',
      at: Date.now()
    });
  } else {
    s.log.push({
      text: { es: 'Reaccionas... pero no era la respuesta.', en: 'You react... but it was not the answer.' },
      tone: 'enemy',
      at: Date.now()
    });
  }
  return { state: s, events };
}

/** Avanza el combate dt milisegundos (cooldowns, casts, estados, IA). */
export function tick(
  state: CombatState,
  dtMs: number,
  attackStat: number,
  magicStat: number,
  allActions: CombatAction[],
  rng: Rng = Math.random
): TickResult {
  let s = structuredClone(state);
  const events: CombatEvent[] = [];
  if (s.phase !== 'active') return { state: s, events };
  const enemy = getEnemy(s.enemyId);

  // Cooldowns
  for (const id of Object.keys(s.cooldowns)) {
    s.cooldowns[id] = Math.max(0, s.cooldowns[id] - dtMs);
  }
  // Regeneración pasiva de stamina
  s.playerStamina = Math.min(s.playerMaxStamina, s.playerStamina + (dtMs / 1000) * 4);

  // Canalización del jugador (§16)
  if (s.casting) {
    s.casting.remainingMs -= dtMs;
    if (s.casting.remainingMs <= 0) {
      const action = allActions.find((a) => a.id === s.casting!.actionId);
      s.casting = null;
      if (action) s = resolvePlayerAction(s, action, attackStat, magicStat, rng);
    }
  }

  // Estados por tick (quemadura, veneno, regen...)
  s._statusAcc = ((s as unknown as { _statusAcc?: number })._statusAcc ?? 0) + dtMs;
  const acc = (s as unknown as { _statusAcc: number })._statusAcc;
  if (acc >= STATUS_TICK_MS) {
    (s as unknown as { _statusAcc: number })._statusAcc = acc - STATUS_TICK_MS;
    for (const st of s.enemyStatuses) {
      if ((st.effect === 'burn' || st.effect === 'poisoned' || st.effect === 'bleed') && st.remainingMs > 0) {
        s.enemyHp = Math.max(0, s.enemyHp - st.power);
        s.log.push({
          text:
            st.effect === 'burn'
              ? { es: 'Las llamas muerden a la criatura.', en: 'The flames bite the creature.' }
              : st.effect === 'poisoned'
                ? { es: 'El veneno avanza.', en: 'The poison spreads.' }
                : { es: 'La herida sangra.', en: 'The wound bleeds.' },
          amount: -st.power,
          tone: 'status',
          at: Date.now()
        });
      }
    }
    for (const st of s.playerStatuses) {
      if (st.effect === 'regen' && st.remainingMs > 0) {
        s.playerHp = Math.min(s.playerMaxHp, s.playerHp + st.power);
      }
      if ((st.effect === 'burn' || st.effect === 'poisoned' || st.effect === 'bleed') && st.remainingMs > 0) {
        s.playerHp = Math.max(0, s.playerHp - st.power);
      }
    }
  }
  // Expirar estados
  s.enemyStatuses = s.enemyStatuses.map((st) => ({ ...st, remainingMs: st.remainingMs - dtMs })).filter((st) => st.remainingMs > 0);
  s.playerStatuses = s.playerStatuses.map((st) => ({ ...st, remainingMs: st.remainingMs - dtMs })).filter((st) => st.remainingMs > 0);

  // IA enemiga: telegrafiar → ventana → impacto (§8)
  const { moves, paceMs } = currentMoves(s, enemy);
  if (s.incoming) {
    s.incoming.remainingMs -= dtMs;
    if (s.incoming.remainingMs <= 0) {
      const move = moves.find((m) => m.id === s.incoming!.moveId) ?? enemy.moves.find((m) => m.id === s.incoming!.moveId);
      s.incoming = null;
      if (move) {
        // Barrera reduce daño
        const barrier = s.playerStatuses.find((st) => st.effect === 'barrier');
        const reduction = barrier ? barrier.power / 100 : 0;
        const damage = Math.max(1, Math.round(move.power * enemyDamageMult() * (1 - reduction)));
        s.playerHp = Math.max(0, s.playerHp - damage);
        s.log.push({ text: move.impact, amount: -damage, tone: 'enemy', at: Date.now() });
        if (move.applies && rng() < move.applies.chance) {
          s.playerStatuses = addStatus(s.playerStatuses, move.applies.effect, move.applies.durationMs, move.applies.power);
        }
      }
    }
  } else if (!hasStatus(s.enemyStatuses, 'stun') && !hasStatus(s.enemyStatuses, 'freeze')) {
    s._enemyAcc = ((s as unknown as { _enemyAcc?: number })._enemyAcc ?? 0) + dtMs;
    const eacc = (s as unknown as { _enemyAcc: number })._enemyAcc;
    if (eacc >= paceMs && moves.length > 0) {
      (s as unknown as { _enemyAcc: number })._enemyAcc = 0;
      const move = moves[Math.floor(rng() * moves.length)];
      s.incoming = { moveId: move.id, remainingMs: Math.round(move.windowMs * reactionWindowMult()) };
      s.log.push({ text: move.telegraph, tone: 'enemy', at: Date.now() });
    }
  }

  // Cambio de fase de jefe (§14)
  if (enemy.phases) {
    const ratio = s.enemyHp / s.enemyMaxHp;
    let phase = 0;
    for (let i = 0; i < enemy.phases.length; i++) {
      if (ratio < enemy.phases[i].hpBelow) phase = i + 1;
    }
    if (phase !== s.currentPhase) {
      s.currentPhase = phase;
      const entry = enemy.phases[phase - 1]?.entryText;
      if (entry) s.log.push({ text: entry, tone: 'system', at: Date.now() });
      events.push({ type: 'ENEMY_PHASE_CHANGED', phase });
    }
  }

  // Fin del combate (§20-21)
  if (s.enemyHp <= 0) {
    s.phase = 'victory';
    events.push({ type: 'COMBAT_WON', enemyId: s.enemyId });
  } else if (s.playerHp <= 0) {
    s.phase = 'defeat';
    events.push({ type: 'COMBAT_LOST', enemyId: s.enemyId });
  }
  return { state: s, events };
}

/**
 * COMBO COOPERATIVO (§42, §67): si la acción del compañero (elemento A)
 * llegó hace poco y yo uso elemento B, puede dispararse un combo.
 */
export function tryCoopCombo(
  state: CombatState,
  myElement: Element,
  partnerElement: Element,
  rng: Rng = Math.random
): { state: CombatState; comboId: string | null } {
  const rule = COMBO_RULES.find(
    (r) =>
      (r.elements[0] === myElement && r.elements[1] === partnerElement) ||
      (r.elements[0] === partnerElement && r.elements[1] === myElement)
  );
  if (!rule) return { state, comboId: null };
  const s = structuredClone(state);
  const damage = Math.round(rule.bonusDamage * (0.9 + rng() * 0.2));
  s.enemyHp = Math.max(0, s.enemyHp - damage);
  if (rule.applies) {
    s.enemyStatuses = addStatus(s.enemyStatuses, rule.applies.effect, rule.applies.durationMs, rule.applies.power);
  }
  s.log.push({ text: rule.text, amount: -damage, tone: 'combo', at: Date.now() });
  if (s.enemyHp <= 0) s.phase = 'victory';
  return { state: s, comboId: rule.id };
}

// Campos internos de acumulación (no forman parte del contrato público).
declare module './types' {
  interface CombatState {
    _statusAcc?: number;
    _enemyAcc?: number;
  }
}
