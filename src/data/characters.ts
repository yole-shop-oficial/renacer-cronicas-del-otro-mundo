import type { CharacterTemplate } from '@/domain/types';

/**
 * Los 8 personajes iniciales (§12). No son skins: cada uno tiene
 * stats, talentos y tags narrativos que abren eventos únicos.
 */
export const CHARACTER_TEMPLATES: CharacterTemplate[] = [
  {
    id: 'liria',
    defaultName: 'Liria',
    baseStats: { strength: 3, intelligence: 7, agility: 5, vitality: 4, luck: 5, willpower: 6, charisma: 5 },
    talents: ['fast_learner', 'night_reader'],
    narrativeTags: ['bookworm', 'observer']
  },
  {
    id: 'kael',
    defaultName: 'Kael',
    baseStats: { strength: 7, intelligence: 3, agility: 5, vitality: 6, luck: 3, willpower: 5, charisma: 4 },
    talents: ['iron_grip', 'unbreakable'],
    narrativeTags: ['protector', 'stubborn']
  },
  {
    id: 'sera',
    defaultName: 'Sera',
    baseStats: { strength: 3, intelligence: 5, agility: 4, vitality: 4, luck: 4, willpower: 5, charisma: 8 },
    talents: ['silver_tongue', 'empath'],
    narrativeTags: ['diplomat', 'kind']
  },
  {
    id: 'dorn',
    defaultName: 'Dorn',
    baseStats: { strength: 5, intelligence: 4, agility: 3, vitality: 8, luck: 3, willpower: 6, charisma: 3 },
    talents: ['survivor', 'stone_skin'],
    narrativeTags: ['veteran', 'quiet']
  },
  {
    id: 'mika',
    defaultName: 'Mika',
    baseStats: { strength: 3, intelligence: 4, agility: 8, vitality: 4, luck: 6, willpower: 4, charisma: 4 },
    talents: ['light_feet', 'sixth_sense'],
    narrativeTags: ['trickster', 'curious']
  },
  {
    id: 'elara',
    defaultName: 'Elara',
    baseStats: { strength: 2, intelligence: 6, agility: 4, vitality: 4, luck: 4, willpower: 8, charisma: 5 },
    talents: ['inner_light', 'calm_mind'],
    narrativeTags: ['faithful', 'gentle']
  },
  {
    id: 'ryn',
    defaultName: 'Ryn',
    baseStats: { strength: 4, intelligence: 5, agility: 5, vitality: 4, luck: 8, willpower: 3, charisma: 4 },
    talents: ['gambler', 'lucky_star'],
    narrativeTags: ['wanderer', 'gambler']
  },
  {
    id: 'thessa',
    defaultName: 'Thessa',
    baseStats: { strength: 5, intelligence: 5, agility: 5, vitality: 5, luck: 4, willpower: 5, charisma: 5 },
    talents: ['balanced_soul', 'quick_study'],
    narrativeTags: ['balanced', 'leader']
  }
];

export const templateById = (id: string) => {
  const t = CHARACTER_TEMPLATES.find((t) => t.id === id);
  if (!t) throw new Error(`Personaje desconocido: ${id}`);
  return t;
};
