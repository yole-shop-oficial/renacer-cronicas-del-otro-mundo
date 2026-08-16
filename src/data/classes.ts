import type { ClassDef } from '@/domain/types';

/** Las 8 clases iniciales (§13). El motor admite más tiers sin cambios. */
export const CLASSES: ClassDef[] = [
  {
    id: 'warrior',
    tier: 'base',
    baseStats: { strength: 4, vitality: 3 },
    startingSkills: ['power_strike', 'intimidation'],
    startingItems: ['iron_sword']
  },
  {
    id: 'knight',
    tier: 'base',
    baseStats: { vitality: 4, willpower: 2, strength: 1 },
    startingSkills: ['shield_guard', 'persuasion'],
    startingItems: ['squire_shield']
  },
  {
    id: 'mage',
    tier: 'base',
    baseStats: { intelligence: 5, willpower: 2 },
    startingSkills: ['fireball', 'detect_magic'],
    startingItems: ['apprentice_staff']
  },
  {
    id: 'archer',
    tier: 'base',
    baseStats: { agility: 4, luck: 2, strength: 1 },
    startingSkills: ['precise_shot', 'analyze'],
    startingItems: ['shortbow']
  },
  {
    id: 'priest',
    tier: 'base',
    baseStats: { willpower: 4, charisma: 2, intelligence: 1 },
    startingSkills: ['heal', 'persuasion'],
    startingItems: ['blessed_amulet']
  },
  {
    id: 'rogue',
    tier: 'base',
    baseStats: { agility: 3, luck: 3, charisma: 1 },
    startingSkills: ['stealth', 'analyze'],
    startingItems: ['curved_dagger']
  },
  {
    id: 'summoner',
    tier: 'base',
    baseStats: { intelligence: 3, willpower: 3, luck: 1 },
    startingSkills: ['summon_wisp', 'detect_magic'],
    startingItems: ['binding_tome']
  },
  {
    id: 'adventurer',
    tier: 'base',
    baseStats: { strength: 1, intelligence: 1, agility: 1, vitality: 1, luck: 1, willpower: 1, charisma: 1 },
    startingSkills: ['analyze', 'persuasion'],
    startingItems: ['travel_pack']
  }
];

export const classById = (id: string) => {
  const c = CLASSES.find((c) => c.id === id);
  if (!c) throw new Error(`Clase desconocida: ${id}`);
  return c;
};
