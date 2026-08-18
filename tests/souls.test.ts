import { describe, it, expect } from 'vitest';
import { buildSoulProfile, encodeSoulCode, decodeSoulCode } from '@/services/souls';
import type { GameSave } from '@/domain/types';

function makeSave(): GameSave {
  return {
    gameId: 'g1',
    characterId: 'soul-abc',
    currentNodeId: 'c1_02',
    character: {
      id: 'soul-abc', templateId: 'liria', name: 'Alba', gender: 'f',
      classId: 'mage', goddessId: 'aurelia', level: 4, xp: 120,
      unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
      stats: { strength: 3, intelligence: 12, agility: 5, vitality: 4, luck: 5, willpower: 8, charisma: 5 },
      currentHp: 90, currentMp: 70, skills: ['analyze'],
      inventory: [], gold: 25, titles: ['friend_of_the_mist'], reputation: {}
    },
    world: {
      flags: {}, discoveredRegions: ['aldea_brumal', 'bosque_susurros'],
      currentRegionId: 'bosque_susurros',
      npcRelationships: {}, npcMemory: {}, quests: [], decisions: []
    },
    updatedAt: Date.now(),
    schemaVersion: 2
  };
}

describe('Almas sincronizadas (sin backend)', () => {
  it('codifica y decodifica el alma sin pérdida', () => {
    const profile = buildSoulProfile(makeSave(), 245);
    const code = encodeSoulCode(profile);
    expect(code.startsWith('ALMA1.')).toBe(true);
    const decoded = decodeSoulCode(code);
    expect(decoded.name).toBe('Alba');
    expect(decoded.level).toBe(4);
    expect(decoded.power).toBe(245);
    expect(decoded.regionId).toBe('bosque_susurros');
    expect(decoded.titles).toContain('friend_of_the_mist');
  });

  it('el código es url-safe (sin +, /, =)', () => {
    const code = encodeSoulCode(buildSoulProfile(makeSave(), 245));
    expect(code).not.toMatch(/[+/=]/);
  });

  it('soporta nombres con acentos y ñ', () => {
    const save = makeSave();
    save.character.name = 'Ñilüe Ándra';
    const decoded = decodeSoulCode(encodeSoulCode(buildSoulProfile(save, 100)));
    expect(decoded.name).toBe('Ñilüe Ándra');
  });

  it('rechaza códigos corruptos o ajenos', () => {
    expect(() => decodeSoulCode('BASURA')).toThrow();
    expect(() => decodeSoulCode('ALMA1.!!!!')).toThrow();
    expect(() => decodeSoulCode('ALMA1.' + btoa('{"x":1}'))).toThrow();
  });
});
