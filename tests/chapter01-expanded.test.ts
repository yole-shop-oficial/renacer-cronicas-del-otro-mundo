import { describe, it, expect, beforeEach } from 'vitest';
import { createStoryEngine } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { CHAPTER_01 } from '@/content/story/chapter01';
import type { CharacterState, WorldState } from '@/domain/types';

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'c', templateId: 'liria', name: 'Alba', gender: 'f', classId: 'mage', goddessId: 'aurelia',
    level: 1, xp: 0,
    unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
    stats: { strength: 3, intelligence: 10, agility: 5, vitality: 4, luck: 5, willpower: 6, charisma: 5 },
    currentHp: 100, currentMp: 50,
    skills: ['analyze', 'persuasion'],
    inventory: [], gold: 10, titles: [], reputation: {},
    ...overrides
  };
}

function makeWorld(overrides: Partial<WorldState> = {}): WorldState {
  return {
    flags: {}, discoveredRegions: ['aldea_brumal'], currentRegionId: 'aldea_brumal',
    npcRelationships: {}, npcMemory: {}, quests: [], decisions: [],
    ...overrides
  };
}

describe('Capítulo 1 ampliado — vida de aldea', () => {
  let engine: ReturnType<typeof createStoryEngine>;

  beforeEach(() => {
    engine = createStoryEngine();
  });

  it('valida el capítulo ampliado (saltos íntegros)', () => {
    expect(() => validateChapter(CHAPTER_01)).not.toThrow();
  });

  it('desde Marta se puede preguntar por Bren, pasear o ir directo', () => {
    const node = engine.getNode('c1_03_honest');
    const ids = node.choices.map((c) => c.id);
    expect(ids).toContain('c1_03h_who_bren');
    expect(ids).toContain('c1_03h_walk');
    expect(ids).toContain('c1_03h_quest');
  });

  it('preguntar por Bren revela su historia (puente de Vharen, Nara)', () => {
    const r = engine.enterNode(engine.getNode('c1_03b_bren'), makeCharacter(), makeWorld());
    expect(r.world.flags.knows_bren_story).toBe(true);
  });

  it('conocer la historia de Bren desbloquea el diálogo sobre Nara', () => {
    const node = engine.getNode('c1_04');
    const withStory = engine.availableChoices(
      node, makeCharacter(), makeWorld({ flags: { knows_bren_story: true } })
    );
    expect(withStory.available.map((c) => c.id)).toContain('c1_04_mention_nara');
    // Y oculta la pregunta redundante de quién es:
    expect(withStory.available.map((c) => c.id)).not.toContain('c1_04_whoareyou');

    const without = engine.availableChoices(node, makeCharacter(), makeWorld());
    expect(without.available.map((c) => c.id)).toContain('c1_04_whoareyou');
    expect(without.available.map((c) => c.id)).not.toContain('c1_04_mention_nara');
  });

  it('el paseo por la aldea lleva a la forja de Joren y a conocer a Pip', () => {
    const walk = engine.getNode('c1_walk');
    const ids = walk.choices.map((c) => c.id);
    expect(ids).toContain('c1_walk_forge');
    expect(ids).toContain('c1_walk_kids');
  });

  it('Joren regala la piedra de afilar de su abuela al aceptar', () => {
    const node = engine.getNode('c1_forge');
    const choice = node.choices.find((c) => c.id === 'c1_forge_sharpen')!;
    const r = engine.choose(node, choice, makeCharacter(), makeWorld(), 'd-forge');
    expect(r.character.inventory.some((e) => e.itemId === 'sharpening_stone')).toBe(true);
    expect(r.world.flags.gear_sharpened).toBe(true);
  });

  it('creer a Pip sube su confianza; dudar la baja y él lo recuerda', () => {
    const node = engine.getNode('c1_pip');
    const believe = node.choices.find((c) => c.id === 'c1_pip_believe')!;
    const rb = engine.choose(node, believe, makeCharacter(), makeWorld(), 'd-believe');
    expect(rb.world.npcRelationships.pip.trust).toBe(15);
    expect(rb.world.npcMemory.pip).toContain('player_believed_pip');

    const doubt = node.choices.find((c) => c.id === 'c1_pip_doubt')!;
    const rd = engine.choose(node, doubt, makeCharacter(), makeWorld(), 'd-doubt');
    expect(rd.world.npcRelationships.pip.trust).toBe(-5);
    expect(rd.world.npcMemory.pip).toContain('player_doubted_pip');
  });

  it('el camino lleva al primer combate; tras vencer, Pip aparece si lo conociste', () => {
    // §102: el primer combate está en el camino al bosque.
    const road = engine.getNode('c1_road');
    expect(road.choices[0].goto).toBe('c1_wolf');
    const wolf = engine.getNode('c1_wolf');
    expect(wolf.combatId).toBe('lobo_famelico');
    expect(wolf.victoryGoto).toBe('c1_wolf_after');
    expect(wolf.defeatGoto).toBe('c1_wolf_defeat');

    // Tras la victoria: bifurcación según conocer a Pip.
    const after = engine.getNode('c1_wolf_after');
    const withPip = engine.availableChoices(
      after, makeCharacter(), makeWorld({ flags: { met_pip: true } })
    );
    expect(withPip.available.map((c) => c.id)).toEqual(['c1_wolfafter_pip']);
    const withoutPip = engine.availableChoices(after, makeCharacter(), makeWorld());
    expect(withoutPip.available.map((c) => c.id)).toEqual(['c1_wolfafter_alone']);
  });

  it('aceptar a Pip como compañero abre la opción [Pip] en el encuentro', () => {
    const encounter = engine.getNode('c1_05');
    const withCompanion = engine.availableChoices(
      encounter, makeCharacter({ skills: [] }), makeWorld({ flags: { pip_companion: true } })
    );
    expect(withCompanion.available.map((c) => c.id)).toContain('c1_05_pip_whisper');

    const alone = engine.availableChoices(encounter, makeCharacter({ skills: [] }), makeWorld());
    expect(alone.available.map((c) => c.id)).not.toContain('c1_05_pip_whisper');
  });

  it('rechazar a Pip gana su respeto (decisión con matices, no castigo)', () => {
    const node = engine.getNode('c1_pip_offer');
    const no = node.choices.find((c) => c.id === 'c1_pip_offer_no')!;
    const r = engine.choose(node, no, makeCharacter(), makeWorld({ flags: { met_pip: true } }), 'd-no');
    expect(r.world.npcRelationships.pip.respect).toBe(10);
    expect(r.world.flags.went_alone).toBe(true);
  });

  it('contar la pista de Pip a Bren da el mapa marcado', () => {
    const r = engine.enterNode(engine.getNode('c1_04_pipinfo'), makeCharacter(), makeWorld());
    expect(r.world.flags.has_marked_map).toBe(true);
  });

  it('tras la misión se puede volver a contarle a Pip (si lo conociste)', () => {
    const node = engine.getNode('c1_08');
    const withPip = engine.availableChoices(
      node, makeCharacter(), makeWorld({ flags: { met_pip: true } })
    );
    expect(withPip.available.map((c) => c.id)).toContain('c1_08_tell_pip');

    const without = engine.availableChoices(node, makeCharacter(), makeWorld());
    expect(without.available.map((c) => c.id)).not.toContain('c1_08_tell_pip');
  });
});
