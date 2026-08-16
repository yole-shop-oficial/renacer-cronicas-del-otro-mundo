import type { Effect } from '@/engine/schema';

/**
 * NEGOCIACIÓN DE DECISIONES ENTRE DOS ALMAS — lógica pura.
 *
 * Reglas (definidas por el diseñador del juego):
 * 1. Ambas almas eligen en el mismo nodo.
 * 2. Si eligen LO MISMO → acuerdo inmediato, la historia sigue.
 * 3. Si eligen DISTINTO → discordancia:
 *    a. Cualquiera puede CEDER (aceptar la decisión del otro) y se sigue.
 *    b. Si nadie cede, se invocan los DADOS DE LOS DIOSES DEL DESTINO:
 *       cada alma tira 1d20, puro azar. Empate = se repite la tirada.
 *       La decisión del GANADOR se aplica para ambos.
 *    c. El perdedor puede DESAFIAR AL DESTINO: se separa del grupo y
 *       sigue su propia decisión... pero paga un PRECIO CARO al Dios
 *       del Destino (la Marca del Destino).
 */

export type NegotiationPhase =
  | 'waiting_picks'   // esperando la elección de una o ambas almas
  | 'agreed'          // misma elección → seguir
  | 'discord'         // elecciones distintas → ceder o dados
  | 'rolling'         // dados invocados, esperando tiradas
  | 'resolved'        // decisión final acordada (por cesión o dados)
  | 'separated';      // el perdedor desafió al destino → grupo separado

export interface NegotiationState {
  nodeId: string;
  phase: NegotiationPhase;
  myPick?: string;
  partnerPick?: string;
  myRoll?: number;
  partnerRoll?: number;
  /** Elección que se aplica a ambos al resolver. */
  resolvedChoiceId?: string;
  /** true si la resolución vino de los dados (no de cesión). */
  byDice?: boolean;
  /** Quién ganó los dados: 'me' | 'partner'. */
  diceWinner?: 'me' | 'partner';
  /** true si YO me separé desafiando al destino. */
  iDefied?: boolean;
  /** true si el COMPAÑERO se separó desafiando al destino. */
  partnerDefied?: boolean;
}

export function createNegotiation(nodeId: string): NegotiationState {
  return { nodeId, phase: 'waiting_picks' };
}

export type NegotiationEvent =
  | { type: 'my_pick'; choiceId: string }
  | { type: 'partner_pick'; choiceId: string }
  | { type: 'i_yield' }
  | { type: 'partner_yields' }
  | { type: 'dice_invoked' }
  | { type: 'my_roll'; value: number }
  | { type: 'partner_roll'; value: number }
  | { type: 'i_defy' }
  | { type: 'partner_defies' };

export function reduceNegotiation(
  state: NegotiationState,
  event: NegotiationEvent
): NegotiationState {
  const s = { ...state };
  switch (event.type) {
    case 'my_pick':
      s.myPick = event.choiceId;
      break;
    case 'partner_pick':
      s.partnerPick = event.choiceId;
      break;
    case 'i_yield':
      if (s.phase === 'discord' && s.partnerPick) {
        s.resolvedChoiceId = s.partnerPick;
        s.phase = 'resolved';
        s.byDice = false;
      }
      return s;
    case 'partner_yields':
      if (s.phase === 'discord' && s.myPick) {
        s.resolvedChoiceId = s.myPick;
        s.phase = 'resolved';
        s.byDice = false;
      }
      return s;
    case 'dice_invoked':
      if (s.phase === 'discord') {
        s.phase = 'rolling';
        s.myRoll = undefined;
        s.partnerRoll = undefined;
      }
      return s;
    case 'my_roll':
      if (s.phase === 'rolling') s.myRoll = event.value;
      break;
    case 'partner_roll':
      if (s.phase === 'rolling') s.partnerRoll = event.value;
      break;
    case 'i_defy':
      // Solo puede desafiar quien PERDIÓ los dados.
      if (s.phase === 'resolved' && s.byDice && s.diceWinner === 'partner') {
        s.phase = 'separated';
        s.iDefied = true;
      }
      return s;
    case 'partner_defies':
      if (s.phase === 'resolved' && s.byDice && s.diceWinner === 'me') {
        s.phase = 'separated';
        s.partnerDefied = true;
      }
      return s;
  }

  // Transiciones automáticas tras registrar picks/rolls:
  if (s.phase === 'waiting_picks' && s.myPick && s.partnerPick) {
    if (s.myPick === s.partnerPick) {
      s.phase = 'agreed';
      s.resolvedChoiceId = s.myPick;
    } else {
      s.phase = 'discord';
    }
  }

  if (s.phase === 'rolling' && s.myRoll !== undefined && s.partnerRoll !== undefined) {
    if (s.myRoll === s.partnerRoll) {
      // Empate: los dioses piden repetir. Se limpian las tiradas.
      s.myRoll = undefined;
      s.partnerRoll = undefined;
    } else {
      const iWin = s.myRoll > s.partnerRoll;
      s.diceWinner = iWin ? 'me' : 'partner';
      s.resolvedChoiceId = iWin ? s.myPick : s.partnerPick;
      s.phase = 'resolved';
      s.byDice = true;
    }
  }

  return s;
}

/** Tirada 1d20 de los dioses del destino: puro azar. */
export function rollDivineDice(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % 20) + 1;
}

/**
 * EL PRECIO CARO — La Marca del Destino.
 * Quien desafía el veredicto de los dados paga:
 *  - La mitad de su oro (ofrenda forzosa al Dios del Destino).
 *  - Una herida del alma: -15 de daño.
 *  - La Marca: flag persistente que la narrativa recordará, y que
 *    reduce su suerte mientras dure (-3 Suerte).
 */
export const DEFY_FATE_PRICE: Effect[] = [
  { kind: 'setFlag', key: 'marca_del_destino', value: true },
  { kind: 'changeStat', key: 'luck', amount: -3 },
  { kind: 'damage', amount: 15 },
  { kind: 'grantTitle', key: 'fate_defiant' }
];

/** El oro se calcula aparte porque es proporcional (la mitad). */
export function defyFateGoldPrice(currentGold: number): number {
  return Math.floor(currentGold / 2);
}
