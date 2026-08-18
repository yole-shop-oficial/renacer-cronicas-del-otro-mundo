import { describe, it, expect } from 'vitest';
import { addTrait, traitValue, dominantTrait, TRAIT_COMBAT_UNLOCKS, TRAITS } from '@/domain/personality';
import { applyEffect } from '@/engine/effects';
import { RUMORS, availableRumors } from '@/data/rumors';
import { MEMORIES, earnedMemories } from '@/data/memories';
import { REGIONS } from '@/data/world';
import { actionsForCharacter, actionById } from '@/data/combatActions';
import { exportSave, importSave } from '@/services/backup';
import { enemyDamageMult, reactionWindowMult, setDifficulty } from '@/combat/difficulty';
import type { CharacterState, WorldState, GameSave } from '@/domain/types';

function makeCharacter(): CharacterState {
  return {
    id: 'c', templateId: 'liria', name: 'Alba', gender: 'f', classId: 'mage', goddessId: 'aurelia',
    level: 1, xp: 0, unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
    stats: { strength: 5, intelligence: 5, agility: 5, vitality: 5, luck: 5, willpower: 5, charisma: 5 },
    currentHp: 100, currentMp: 50, skills: [], inventory: [], gold: 10, titles: [], reputation: {}
  };
}

const world = (): WorldState => ({
  flags: {}, discoveredRegions: ['aldea_brumal'], currentRegionId: 'aldea_brumal',
  npcRelationships: {}, npcMemory: {}, quests: [], decisions: []
});

describe('Personalidad (§27-28)', () => {
  it('addTrait acumula y satura en ±10', () => {
    let p = addTrait(undefined, 'courage', 3);
    p = addTrait(p, 'courage', 20);
    expect(traitValue(p, 'courage')).toBe(10);
    p = addTrait(p, 'courage', -25);
    expect(traitValue(p, 'courage')).toBe(-10);
  });

  it('el efecto changeTrait moldea la personalidad', () => {
    const r = applyEffect({ kind: 'changeTrait', key: 'compassion', amount: 2 }, makeCharacter(), world());
    expect(traitValue(r.character.personality, 'compassion')).toBe(2);
    expect(r.log.some((l) => l.key === 'log.traitChanged')).toBe(true);
  });

  it('dominantTrait exige al menos 2 puntos', () => {
    expect(dominantTrait({ courage: 1 })).toBeNull();
    expect(dominantTrait({ courage: 3, prudence: 1 })).toBe('courage');
  });

  it('los rasgos desbloquean acciones de combate (§28)', () => {
    for (const u of TRAIT_COMBAT_UNLOCKS) {
      expect(TRAITS).toContain(u.trait);
      expect(actionById(u.actionId)).toBeDefined();
    }
    const none = actionsForCharacter([], []);
    expect(none.some((a) => a.id === 'furia')).toBe(false);
    const brave = actionsForCharacter([], ['furia']);
    expect(brave.some((a) => a.id === 'furia')).toBe(true);
  });

  it('las decisiones de los capítulos siembran rasgos', async () => {
    const { CHAPTER_01 } = await import('@/content/story/chapter01');
    const all = CHAPTER_01.nodes.flatMap((n) => n.choices.flatMap((c) => c.effects));
    expect(all.some((e) => e.kind === 'changeTrait')).toBe(true);
  });
});

describe('Rumores (§35)', () => {
  it('hay rumores verdaderos, falsos y parciales', () => {
    const truths = new Set(RUMORS.map((r) => r.truth));
    expect(truths.has('true')).toBe(true);
    expect(truths.has('false')).toBe(true);
    expect(truths.has('partial')).toBe(true);
  });

  it('se desbloquean por región descubierta y flag', () => {
    const base = availableRumors({}, ['aldea_brumal']);
    expect(base.some((r) => r.id === 'rumor_mist_shadow')).toBe(true);
    expect(base.some((r) => r.id === 'rumor_bren_medal')).toBe(false);
    const withFlag = availableRumors({ asked_about_bren: true }, ['aldea_brumal']);
    expect(withFlag.some((r) => r.id === 'rumor_bren_medal')).toBe(true);
  });

  it('referencian regiones reales', () => {
    const ids = new Set(REGIONS.map((r) => r.id));
    for (const r of RUMORS) expect(ids.has(r.sourceRegion)).toBe(true);
  });
});

describe('Recuerdos (§32/§39)', () => {
  it('se ganan por flags del mundo', () => {
    expect(earnedMemories({})).toHaveLength(0);
    const some = earnedMemories({ accepted_rebirth: true, won_first_combat: true });
    expect(some.map((m) => m.id)).toEqual(['mem_rebirth', 'mem_first_combat']);
  });

  it('ids únicos y flags no vacíos', () => {
    const ids = new Set(MEMORIES.map((m) => m.id));
    expect(ids.size).toBe(MEMORIES.length);
    for (const m of MEMORIES) expect(m.flag.length).toBeGreaterThan(0);
  });
});

describe('Backup (§96)', () => {
  it('exporta e importa sin pérdida y valida corrupción', () => {
    const save: GameSave = {
      gameId: 'g1', characterId: 'c', currentNodeId: 'pro_01',
      character: makeCharacter(), world: world(), updatedAt: Date.now(), schemaVersion: 2
    };
    const code = exportSave(save);
    expect(code.startsWith('RENACER1.')).toBe(true);
    expect(importSave(code)).toEqual(save);
    // corrupción → rechazo
    const corrupted = code.slice(0, -6) + 'XXXXXX';
    expect(() => importSave(corrupted)).toThrow();
    expect(() => importSave('BASURA')).toThrow();
  });
});

describe('Dificultad (§108)', () => {
  it('historia suaviza, difícil endurece, y las ventanas se ajustan', () => {
    setDifficulty('story');
    expect(enemyDamageMult()).toBeLessThan(1);
    expect(reactionWindowMult()).toBeGreaterThan(1);
    setDifficulty('hard');
    expect(enemyDamageMult()).toBeGreaterThan(1);
    expect(reactionWindowMult()).toBeLessThan(1);
    setDifficulty('normal');
    expect(enemyDamageMult()).toBe(1);
  });
});
