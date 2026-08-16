import { describe, it, expect } from 'vitest';
import {
  createNegotiation,
  reduceNegotiation,
  rollDivineDice,
  defyFateGoldPrice,
  DEFY_FATE_PRICE,
  type NegotiationState
} from '@/coop/negotiation';

function run(state: NegotiationState, ...events: Parameters<typeof reduceNegotiation>[1][]) {
  return events.reduce((s, e) => reduceNegotiation(s, e), state);
}

describe('Negociación de decisiones entre dos almas', () => {
  it('misma elección → acuerdo inmediato', () => {
    const s = run(
      createNegotiation('n1'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'a' }
    );
    expect(s.phase).toBe('agreed');
    expect(s.resolvedChoiceId).toBe('a');
  });

  it('elecciones distintas → discordia', () => {
    const s = run(
      createNegotiation('n1'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'b' }
    );
    expect(s.phase).toBe('discord');
    expect(s.resolvedChoiceId).toBeUndefined();
  });

  it('ceder resuelve con la decisión del otro', () => {
    const s = run(
      createNegotiation('n1'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'b' },
      { type: 'i_yield' }
    );
    expect(s.phase).toBe('resolved');
    expect(s.resolvedChoiceId).toBe('b');
    expect(s.byDice).toBe(false);
  });

  it('si el compañero cede, gana mi decisión', () => {
    const s = run(
      createNegotiation('n1'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'b' },
      { type: 'partner_yields' }
    );
    expect(s.resolvedChoiceId).toBe('a');
  });

  it('dados: gana la tirada más alta y su decisión se aplica', () => {
    const s = run(
      createNegotiation('n1'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'b' },
      { type: 'dice_invoked' },
      { type: 'my_roll', value: 17 },
      { type: 'partner_roll', value: 9 }
    );
    expect(s.phase).toBe('resolved');
    expect(s.byDice).toBe(true);
    expect(s.diceWinner).toBe('me');
    expect(s.resolvedChoiceId).toBe('a');
  });

  it('empate en los dados → los dioses piden repetir', () => {
    const s = run(
      createNegotiation('n1'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'b' },
      { type: 'dice_invoked' },
      { type: 'my_roll', value: 12 },
      { type: 'partner_roll', value: 12 }
    );
    expect(s.phase).toBe('rolling');
    expect(s.myRoll).toBeUndefined();
    expect(s.partnerRoll).toBeUndefined();
  });

  it('solo el PERDEDOR puede desafiar al destino', () => {
    const lost = run(
      createNegotiation('n1'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'b' },
      { type: 'dice_invoked' },
      { type: 'my_roll', value: 3 },
      { type: 'partner_roll', value: 18 },
      { type: 'i_defy' }
    );
    expect(lost.phase).toBe('separated');
    expect(lost.iDefied).toBe(true);

    // El ganador NO puede desafiar:
    const won = run(
      createNegotiation('n2'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'b' },
      { type: 'dice_invoked' },
      { type: 'my_roll', value: 18 },
      { type: 'partner_roll', value: 3 },
      { type: 'i_defy' }
    );
    expect(won.phase).toBe('resolved'); // sin cambio
  });

  it('no se puede desafiar tras una cesión (solo tras dados)', () => {
    const s = run(
      createNegotiation('n1'),
      { type: 'my_pick', choiceId: 'a' },
      { type: 'partner_pick', choiceId: 'b' },
      { type: 'i_yield' },
      { type: 'i_defy' }
    );
    expect(s.phase).toBe('resolved');
  });
});

describe('Dados divinos y precio del desafío', () => {
  it('rollDivineDice devuelve 1-20', () => {
    for (let i = 0; i < 200; i++) {
      const v = rollDivineDice();
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(20);
    }
  });

  it('el precio caro: mitad del oro + marca + herida + suerte', () => {
    expect(defyFateGoldPrice(100)).toBe(50);
    expect(defyFateGoldPrice(7)).toBe(3);
    expect(defyFateGoldPrice(0)).toBe(0);
    const kinds = DEFY_FATE_PRICE.map((e) => e.kind);
    expect(kinds).toContain('setFlag');     // marca_del_destino
    expect(kinds).toContain('damage');      // herida del alma
    expect(kinds).toContain('changeStat');  // -3 suerte
    expect(kinds).toContain('grantTitle');  // Desafiante del Destino
  });
});

describe('Texto a dúo', () => {
  it('el prólogo tiene variantes duoText en los nodos clave', async () => {
    const { PROLOGUE } = await import('@/content/story/prologue');
    const duoNodes = PROLOGUE.nodes.filter((n) => n.duoText);
    expect(duoNodes.length).toBeGreaterThanOrEqual(4);
    // pro_04 menciona a la otra alma:
    const pro04 = PROLOGUE.nodes.find((n) => n.id === 'pro_04');
    expect(pro04?.duoText?.es).toContain('{partner}');
    expect(pro04?.duoText?.es).toContain('Dos almas');
  });
});
