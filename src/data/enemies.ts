import type { EnemyDef } from '@/combat/types';

/**
 * ENEMIGOS (§13) — data-driven, con personalidad y patrones.
 * Incluye el primer jefe con fases (§14, §103).
 */

export const ENEMIES: EnemyDef[] = [
  {
    // Primer combate (§102): enseña atacar/defender/analizar sin tutorial.
    id: 'lobo_famelico',
    maxHp: 60,
    weaknesses: ['fire'],
    resistances: [],
    paceMs: 5200,
    moves: [
      {
        id: 'lf_bite',
        telegraph: { es: 'El lobo baja las orejas y tensa las patas traseras...', en: 'The wolf flattens its ears and coils its hind legs...' },
        impact: { es: 'Sus colmillos te alcanzan el brazo.', en: 'Its fangs catch your arm.' },
        element: 'physical',
        power: 10,
        windowMs: 3200,
        counters: ['dodge', 'defend']
      },
      {
        id: 'lf_howl',
        telegraph: { es: 'Alza el hocico: va a aullar llamando a la manada...', en: 'It raises its muzzle: it is about to howl for the pack...' },
        impact: { es: 'El aullido te hiela la sangre.', en: 'The howl chills your blood.' },
        element: 'physical',
        power: 4,
        windowMs: 3500,
        counters: ['interrupt'],
        applies: { effect: 'fear', chance: 0.5, durationMs: 4000, power: 1 }
      }
    ],
    analyzeReveals: [
      { es: 'Está famélico: ataca por hambre, no por maldad. Salud baja.', en: 'It is starving: it attacks from hunger, not malice. Low health.' },
      { es: 'Debilidad: fuego. Teme las llamas desde algún incendio antiguo.', en: 'Weakness: fire. It fears flame from some old blaze.' }
    ],
    rewards: { xp: 25, gold: 4, items: [{ itemId: 'healing_herb', qty: 1 }] }
  },
  {
    id: 'furtivo_sierpe',
    maxHp: 85,
    weaknesses: ['lightning'],
    resistances: ['poison'],
    paceMs: 4800,
    moves: [
      {
        id: 'fs_slash',
        telegraph: { es: 'El furtivo hace girar su cuchillo de desollar...', en: 'The poacher twirls his skinning knife...' },
        impact: { es: 'El filo te busca las costillas.', en: 'The blade seeks your ribs.' },
        element: 'physical',
        power: 13,
        windowMs: 2900,
        counters: ['dodge', 'defend'],
        applies: { effect: 'bleed', chance: 0.35, durationMs: 5000, power: 3 }
      },
      {
        id: 'fs_net',
        telegraph: { es: 'Saca una red lastrada y la balancea...', en: 'He pulls out a weighted net and swings it...' },
        impact: { es: 'La red te enreda los brazos.', en: 'The net tangles your arms.' },
        element: 'physical',
        power: 6,
        windowMs: 3400,
        counters: ['dodge', 'interrupt'],
        applies: { effect: 'weaken', chance: 0.6, durationMs: 4000, power: 2 }
      }
    ],
    analyzeReveals: [
      { es: 'Mercenario de la Sierpe. Pelea por paga, no por causa: si esto se tuerce, huirá.', en: 'A Serpent mercenary. He fights for coin, not cause: if this sours, he will run.' },
      { es: 'Debilidad: rayo. Su cota de malla conduce de maravilla.', en: 'Weakness: lightning. His chainmail conducts beautifully.' }
    ],
    rewards: { xp: 40, gold: 12 }
  },
  {
    // PRIMER JEFE (§103): fases, debilidades, estados, telegrafiados, decisión.
    id: 'espectro_velo',
    maxHp: 180,
    weaknesses: ['light'],
    resistances: ['physical', 'dark'],
    paceMs: 5000,
    moves: [
      {
        id: 'ev_touch',
        telegraph: { es: 'El espectro extiende una mano de niebla helada...', en: 'The wraith extends a hand of freezing mist...' },
        impact: { es: 'Su tacto te roba el calor del cuerpo.', en: 'Its touch steals the warmth from your body.' },
        element: 'ice',
        power: 12,
        windowMs: 3000,
        counters: ['dodge'],
        applies: { effect: 'freeze', chance: 0.3, durationMs: 2500, power: 1 }
      },
      {
        id: 'ev_wail',
        telegraph: { es: 'Su boca se abre más de lo posible: un lamento se acerca...', en: 'Its mouth opens wider than possible: a wail is coming...' },
        impact: { es: 'El lamento atraviesa tus pensamientos.', en: 'The wail pierces through your thoughts.' },
        element: 'dark',
        power: 14,
        windowMs: 3300,
        counters: ['interrupt', 'counterspell'],
        applies: { effect: 'silence', chance: 0.4, durationMs: 3500, power: 1 }
      }
    ],
    phases: [
      {
        hpBelow: 0.5,
        paceMs: 4000,
        entryText: {
          es: 'El espectro se desgarra a sí mismo: ahora hay DOS rostros en su niebla. Se mueve más rápido, más furioso.',
          en: 'The wraith tears itself apart: now there are TWO faces in its mist. It moves faster, angrier.'
        },
        moves: [
          {
            id: 'ev_double',
            telegraph: { es: 'Ambos rostros aúllan a la vez: la niebla se parte en dos garras...', en: 'Both faces howl at once: the mist splits into two claws...' },
            impact: { es: 'Las garras gemelas te alcanzan desde ángulos imposibles.', en: 'Twin claws reach you from impossible angles.' },
            element: 'dark',
            power: 18,
            windowMs: 2600,
            counters: ['defend'],
            applies: { effect: 'weaken', chance: 0.4, durationMs: 4000, power: 2 }
          },
          {
            id: 'ev_drain',
            telegraph: { es: 'La niebla forma un embudo hacia ti: quiere beberse tu luz...', en: 'The mist funnels toward you: it wants to drink your light...' },
            impact: { es: 'Sientes cómo tu energía fluye hacia el espectro.', en: 'You feel your energy flow into the wraith.' },
            element: 'dark',
            power: 10,
            windowMs: 3600,
            counters: ['interrupt', 'dodge']
          }
        ]
      }
    ],
    analyzeReveals: [
      { es: 'Un alma del velo que no encontró el camino. No odia: DUELE.', en: 'A veil soul that never found its way. It does not hate: it HURTS.' },
      { es: 'Debilidad: luz. Resistente al acero y a la oscuridad.', en: 'Weakness: light. Resistant to steel and darkness.' },
      { es: 'Cuando su niebla se parta en dos, cubre tu guardia: las garras gemelas solo se bloquean.', en: 'When its mist splits in two, keep your guard up: twin claws can only be blocked.' }
    ],
    rewards: { xp: 90, gold: 20, items: [{ itemId: 'mana_flower', qty: 2 }] }
  }
];

export function getEnemy(id: string): EnemyDef {
  const e = ENEMIES.find((e) => e.id === id);
  if (!e) throw new Error(`Enemigo desconocido: ${id}`);
  return e;
}
