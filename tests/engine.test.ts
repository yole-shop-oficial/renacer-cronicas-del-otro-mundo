import { describe, it, expect, beforeEach } from 'vitest';
import { createStoryEngine, FIRST_NODE_ID } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { PROLOGUE } from '@/content/story/prologue';
import { CHAPTER_01 } from '@/content/story/chapter01';
import type { CharacterState, WorldState } from '@/domain/types';

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'test-char',
    templateId: 'liria',
    name: 'Test',
    gender: 'f',
    classId: 'mage',
    goddessId: 'aurelia',
    level: 1,
    xp: 0,
    unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
    stats: { strength: 3, intelligence: 10, agility: 5, vitality: 4, luck: 5, willpower: 6, charisma: 5 },
    currentHp: 100,
    currentMp: 50,
    skills: ['analyze', 'persuasion'],
    inventory: [],
    gold: 0,
    titles: [],
    reputation: {},
    ...overrides
  };
}

function makeWorld(overrides: Partial<WorldState> = {}): WorldState {
  return {
    flags: {},
    discoveredRegions: ['aldea_brumal'],
    currentRegionId: 'aldea_brumal',
    npcRelationships: {},
    npcMemory: {},
    quests: [],
    decisions: [],
    ...overrides
  };
}

describe('Contenido narrativo', () => {
  it('valida el prólogo y el capítulo 1 (saltos íntegros, sin nodos rotos)', () => {
    expect(() => validateChapter(PROLOGUE)).not.toThrow();
    expect(() => validateChapter(CHAPTER_01)).not.toThrow();
  });

  it('rechaza capítulos con saltos a nodos inexistentes', () => {
    const broken = structuredClone(PROLOGUE);
    broken.nodes[0].choices[0].goto = 'nodo_fantasma';
    expect(() => validateChapter(broken)).toThrow(/inexistente/);
  });
});

describe('StoryEngine', () => {
  let engine: ReturnType<typeof createStoryEngine>;

  beforeEach(() => {
    engine = createStoryEngine();
  });

  it('arranca en el primer nodo del prólogo', () => {
    const node = engine.getNode(FIRST_NODE_ID);
    expect(node.chapterId).toBe('prologue');
    expect(node.choices.length).toBeGreaterThan(0);
  });

  it('resuelve saltos entre capítulos (chapter:)', () => {
    const character = makeCharacter();
    const world = makeWorld();
    const node = engine.getNode('pro_07');
    const choice = node.choices[0];
    const result = engine.choose(node, choice, character, world, 'dec-1');
    expect(result.nextNodeId).toBe('c1_01');
  });

  it('filtra opciones por habilidad: [Analizar] requiere analyze', () => {
    const node = engine.getNode('c1_01');
    const withSkill = engine.availableChoices(node, makeCharacter(), makeWorld());
    expect(withSkill.available.map((c) => c.id)).toContain('c1_01_analyze');

    const without = engine.availableChoices(
      node,
      makeCharacter({ skills: [] }),
      makeWorld()
    );
    expect(without.available.map((c) => c.id)).not.toContain('c1_01_analyze');
    expect(without.locked.map((c) => c.id)).toContain('c1_01_analyze');
  });

  it('aplica efectos de una decisión (XP, flags, relaciones)', () => {
    const node = engine.getNode('c1_02');
    const choice = node.choices.find((c) => c.id === 'c1_02_honest')!;
    const result = engine.choose(node, choice, makeCharacter(), makeWorld(), 'dec-2');
    expect(result.world.npcRelationships.marta.trust).toBe(15);
    expect(result.world.npcMemory.marta).toContain('player_told_truth_about_rebirth');
    expect(result.world.decisions).toHaveLength(1);
  });

  it('es idempotente: la misma decisión aplicada dos veces no duplica efectos', () => {
    const node = engine.getNode('c1_02');
    const choice = node.choices.find((c) => c.id === 'c1_02_honest')!;
    const first = engine.choose(node, choice, makeCharacter(), makeWorld(), 'dec-3');
    const second = engine.choose(node, choice, first.character, first.world, 'dec-3');
    expect(second.world.npcRelationships.marta.trust).toBe(15); // no 30
    expect(second.world.decisions).toHaveLength(1);
  });

  it('onEnter solo se aplica una vez por nodo (sin duplicar XP tras recarga)', () => {
    const node = engine.getNode('c1_08');
    const c = makeCharacter();
    const w = makeWorld({ quests: [{ questId: 'quest_whispering_forest', status: 'active', progress: {} }] });
    const first = engine.enterNode(node, c, w);
    const goldAfterFirst = first.character.gold;
    const second = engine.enterNode(node, first.character, first.world);
    expect(second.character.gold).toBe(goldAfterFirst);
    expect(first.character.gold).toBe(10);
  });

  it('bloquea elecciones cuyas condiciones no se cumplen', () => {
    const node = engine.getNode('c1_01');
    const analyzeChoice = node.choices.find((c) => c.id === 'c1_01_analyze')!;
    expect(() =>
      engine.choose(node, analyzeChoice, makeCharacter({ skills: [] }), makeWorld(), 'dec-4')
    ).toThrow(/no disponible/);
  });
});
