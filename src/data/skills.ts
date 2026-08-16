import type { SkillDef } from '@/domain/types';

/** Habilidades narrativas (§16): cada una desbloquea caminos en la historia. */
export const SKILLS: SkillDef[] = [
  { id: 'analyze', classIds: 'all', mpCost: 2, narrativeTags: ['observation', 'combat'] },
  { id: 'persuasion', classIds: 'all', mpCost: 0, narrativeTags: ['dialogue', 'social'] },
  { id: 'intimidation', classIds: ['warrior', 'knight'], mpCost: 0, narrativeTags: ['dialogue', 'combat'] },
  { id: 'heal', classIds: ['priest'], mpCost: 5, narrativeTags: ['support', 'social'] },
  { id: 'fireball', classIds: ['mage'], mpCost: 8, narrativeTags: ['combat', 'magic'] },
  { id: 'stealth', classIds: ['rogue', 'archer'], mpCost: 3, narrativeTags: ['exploration'] },
  { id: 'detect_magic', classIds: ['mage', 'summoner', 'priest'], mpCost: 4, narrativeTags: ['magic', 'exploration'] },
  { id: 'summon_wisp', classIds: ['summoner'], mpCost: 10, narrativeTags: ['magic', 'combat'] },
  { id: 'power_strike', classIds: ['warrior'], mpCost: 4, narrativeTags: ['combat'] },
  { id: 'shield_guard', classIds: ['knight'], mpCost: 3, narrativeTags: ['combat', 'defense'] },
  { id: 'precise_shot', classIds: ['archer'], mpCost: 4, narrativeTags: ['combat'] }
];

export const skillById = (id: string) => {
  const s = SKILLS.find((s) => s.id === id);
  if (!s) throw new Error(`Habilidad desconocida: ${id}`);
  return s;
};
