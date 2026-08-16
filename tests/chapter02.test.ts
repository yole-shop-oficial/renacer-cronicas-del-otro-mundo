import { describe, it, expect, beforeEach } from 'vitest';
import { createStoryEngine } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { CHAPTER_02 } from '@/content/story/chapter02';
import type { CharacterState, WorldState } from '@/domain/types';

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'c', templateId: 'mika', name: 'Test', classId: 'rogue', goddessId: 'sylvane',
    level: 2, xp: 0,
    stats: { strength: 3, intelligence: 4, agility: 8, vitality: 4, luck: 6, willpower: 4, charisma: 4 },
    currentHp: 100, currentMp: 40,
    skills: ['stealth', 'analyze', 'persuasion'],
    inventory: [], gold: 20, titles: [], reputation: {},
    ...overrides
  };
}

function makeWorld(overrides: Partial<WorldState> = {}): WorldState {
  return {
    flags: {}, discoveredRegions: ['aldea_brumal', 'bosque_susurros'],
    currentRegionId: 'bosque_susurros', npcRelationships: {}, npcMemory: {},
    quests: [], decisions: [],
    ...overrides
  };
}

describe('Capítulo 2 — El sello de la Sierpe', () => {
  let engine: ReturnType<typeof createStoryEngine>;

  beforeEach(() => {
    engine = createStoryEngine();
  });

  it('valida el capítulo completo (saltos íntegros)', () => {
    expect(() => validateChapter(CHAPTER_02)).not.toThrow();
  });

  it('el capítulo 1 enlaza con el capítulo 2', () => {
    const endNode = engine.getNode('c1_end');
    const choice = endNode.choices.find((c) => c.id === 'c1_end_continue')!;
    const result = engine.choose(endNode, choice, makeCharacter(), makeWorld(), 'd-link');
    expect(result.nextNodeId).toBe('c2_01');
  });

  it('memoria del mundo (§65): quien liberó a la criatura recibe la ruta de fama', () => {
    const node = engine.getNode('c2_01');
    const heroWorld = makeWorld({ flags: { freed_mist_creature: true } });
    const hero = engine.availableChoices(node, makeCharacter(), heroWorld);
    expect(hero.available.map((c) => c.id)).toEqual(['c2_01_enter_famed']);

    const plain = engine.availableChoices(node, makeCharacter(), makeWorld());
    expect(plain.available.map((c) => c.id)).toEqual(['c2_01_enter_plain']);
  });

  it('al entrar a c2_01 arranca la misión y viaja a Petra', () => {
    const r = engine.enterNode(engine.getNode('c2_01'), makeCharacter(), makeWorld());
    expect(r.world.quests.some((q) => q.questId === 'quest_serpent_seal' && q.status === 'active')).toBe(true);
    expect(r.world.currentRegionId).toBe('ciudad_petra');
    expect(r.world.discoveredRegions).toContain('ciudad_petra');
  });

  it('el nodo del muelle es un evento cooperativo de decisión dual (§35)', () => {
    const node = engine.getNode('c2_06');
    expect(node.coopEventId).toBe('c2_pier_choice');
    expect(node.choices).toHaveLength(2);
  });

  it('rama A: liberar crías otorga título y reputación divergente', () => {
    const node = engine.getNode('c2_06');
    const choice = node.choices.find((c) => c.id === 'c2_06_free_cubs')!;
    const r = engine.choose(node, choice, makeCharacter(), makeWorld(), 'd-cubs');
    expect(r.character.titles).toContain('cub_guardian');
    expect(r.world.flags.coop_c2_freed_cubs).toBe(true);
    expect(r.character.reputation.ciudad_petra).toBe(-5);
    expect(r.character.reputation.aldea_brumal).toBe(10);
    expect(r.nextNodeId).toBe('c2_07_cubs');
  });

  it('rama B: seguir al líder revela al comprador y cierra otra puerta', () => {
    const node = engine.getNode('c2_06');
    const choice = node.choices.find((c) => c.id === 'c2_06_follow_leader')!;
    const r = engine.choose(node, choice, makeCharacter(), makeWorld(), 'd-leader');
    expect(r.world.flags.knows_serpent_buyer).toBe(true);
    expect(r.world.flags.coop_c2_followed_leader).toBe(true);
    expect(r.nextNodeId).toBe('c2_07_leader');
  });

  it('el final del capítulo abre el arco de Servan Vell', () => {
    const c = makeCharacter();
    const w = makeWorld({ quests: [{ questId: 'quest_serpent_seal', status: 'active', progress: {} }] });
    const r = engine.enterNode(engine.getNode('c2_08'), c, w);
    expect(r.world.flags.servan_vell_arc_open).toBe(true);
    expect(r.world.quests.find((q) => q.questId === 'quest_serpent_seal')?.status).toBe('completed');
  });

  it('las rutas de habilidad (sigilo/magia) están bloqueadas sin la habilidad', () => {
    const node = engine.getNode('c2_04');
    const noSkills = engine.availableChoices(node, makeCharacter({ skills: [] }), makeWorld());
    expect(noSkills.available.map((c) => c.id)).toEqual(['c2_04_direct']);
    expect(noSkills.locked).toHaveLength(2);
  });
});
