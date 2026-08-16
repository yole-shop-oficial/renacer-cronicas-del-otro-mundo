import type { GoddessDef } from '@/domain/types';

/**
 * Las Diosas (§14). Su elección tiene consecuencias reales:
 * bendición mecánica + habilidad + tags narrativos que desbloquean
 * eventos exclusivos en los capítulos.
 */
export const GODDESSES: GoddessDef[] = [
  {
    id: 'aurelia',
    blessing: { stat: 'willpower', bonus: 2 },
    grantsSkill: 'heal',
    narrativeTags: ['dawn', 'mercy', 'rebirth']
  },
  {
    id: 'nyxara',
    blessing: { stat: 'intelligence', bonus: 2 },
    grantsSkill: 'detect_magic',
    narrativeTags: ['night', 'secrets', 'knowledge']
  },
  {
    id: 'sylvane',
    blessing: { stat: 'agility', bonus: 2 },
    grantsSkill: 'analyze',
    narrativeTags: ['forest', 'freedom', 'wild']
  },
  {
    id: 'ferra',
    blessing: { stat: 'strength', bonus: 2 },
    grantsSkill: 'intimidation',
    narrativeTags: ['forge', 'war', 'honor']
  }
];

export const goddessById = (id: string) => {
  const g = GODDESSES.find((g) => g.id === id);
  if (!g) throw new Error(`Diosa desconocida: ${id}`);
  return g;
};
