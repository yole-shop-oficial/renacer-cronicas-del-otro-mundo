import type { ItemDef } from '@/domain/types';

/** Catálogo de objetos (§18). Data-driven: añadir objetos = añadir entradas. */
export const ITEMS: ItemDef[] = [
  { id: 'iron_sword', type: 'weapon', rarity: 'common', stats: { strength: 2 }, value: 25 },
  { id: 'squire_shield', type: 'armor', rarity: 'common', stats: { vitality: 2 }, value: 25 },
  { id: 'apprentice_staff', type: 'weapon', rarity: 'common', stats: { intelligence: 2 }, value: 25 },
  { id: 'shortbow', type: 'weapon', rarity: 'common', stats: { agility: 2 }, value: 25 },
  { id: 'blessed_amulet', type: 'magic', rarity: 'uncommon', stats: { willpower: 2 }, value: 40 },
  { id: 'curved_dagger', type: 'weapon', rarity: 'common', stats: { agility: 1, luck: 1 }, value: 20 },
  { id: 'binding_tome', type: 'magic', rarity: 'uncommon', stats: { intelligence: 1, willpower: 1 }, value: 40 },
  { id: 'travel_pack', type: 'material', rarity: 'common', value: 10 },
  { id: 'healing_herb', type: 'consumable', rarity: 'common', effects: { restoreHp: 25 }, value: 8 },
  { id: 'mana_flower', type: 'consumable', rarity: 'uncommon', effects: { restoreMp: 20 }, value: 12 },
  { id: 'goddess_tear', type: 'unique', rarity: 'unique', effects: { grantFlag: 'goddess_tear_owned' }, value: 0 },
  { id: 'old_locket', type: 'quest', rarity: 'rare', value: 0 },
  { id: 'moonlit_mushroom', type: 'material', rarity: 'uncommon', value: 15 },
  { id: 'sharpening_stone', type: 'material', rarity: 'uncommon', effects: { grantFlag: 'joren_heirloom' }, value: 0 }
];

export const itemById = (id: string) => {
  const i = ITEMS.find((i) => i.id === id);
  if (!i) throw new Error(`Objeto desconocido: ${id}`);
  return i;
};
