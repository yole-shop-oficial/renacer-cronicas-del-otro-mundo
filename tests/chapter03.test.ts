import { describe, it, expect, beforeEach } from 'vitest';
import { createStoryEngine } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { CHAPTER_03 } from '@/content/story/chapter03';
import type { CharacterState, WorldState } from '@/domain/types';

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'c', templateId: 'thessa', name: 'Alba', gender: 'f', classId: 'knight', goddessId: 'aurelia',
    level: 4, xp: 0,
    unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {},
    stats: { strength: 8, intelligence: 6, agility: 7, vitality: 9, luck: 5, willpower: 8, charisma: 7 },
    currentHp: 150, currentMp: 60,
    skills: ['shield_guard', 'persuasion', 'analyze'],
    inventory: [], gold: 40, titles: [], reputation: {},
    ...overrides
  };
}

function makeWorld(overrides: Partial<WorldState> = {}): WorldState {
  return {
    flags: { servan_vell_arc_open: true }, discoveredRegions: ['aldea_brumal', 'bosque_susurros', 'ciudad_petra'],
    currentRegionId: 'ciudad_petra', npcRelationships: {}, npcMemory: {}, quests: [], decisions: [],
    ...overrides
  };
}

describe('Capítulo 3 — La cuerda que sube', () => {
  let engine: ReturnType<typeof createStoryEngine>;

  beforeEach(() => {
    engine = createStoryEngine();
  });

  it('valida el capítulo (saltos íntegros) y el C2 enlaza con él', () => {
    expect(() => validateChapter(CHAPTER_03)).not.toThrow();
    const c2end = engine.getNode('c2_08');
    const link = c2end.choices.find((c) => c.id === 'c2_08_continue')!;
    expect(engine.choose(c2end, link, makeCharacter(), makeWorld(), 'd-l').nextNodeId).toBe('c3_01');
  });

  it('PUERTA DE PODER: con poco poder la opción está bloqueada con pista', () => {
    const node = engine.getNode('c3_02');
    const weak = makeCharacter({
      level: 1,
      stats: { strength: 3, intelligence: 3, agility: 3, vitality: 3, luck: 3, willpower: 3, charisma: 3 },
      skills: []
    });
    const r = engine.availableChoices(node, weak, makeWorld());
    expect(r.available.map((c) => c.id)).not.toContain('c3_02_ready');
    expect(r.locked.map((c) => c.id)).toContain('c3_02_ready');
  });

  it('PUERTA DE PODER: con poder suficiente (nivel+stats+skills+vínculos) se abre', () => {
    const strong = makeCharacter({
      level: 6,
      skills: ['shield_guard', 'persuasion', 'analyze', 'rally', 'shield_bash'],
      equipment: { weapon: 'iron_sword', armor: 'squire_shield' }
    });
    const world = makeWorld({
      npcRelationships: {
        joren: { trust: 40, friendship: 40, respect: 20, fear: 0, affection: 0, rivalry: 0 },
        marta: { trust: 50, friendship: 50, respect: 0, fear: 0, affection: 20, rivalry: 0 }
      }
    });
    const node = engine.getNode('c3_02');
    const r = engine.availableChoices(node, strong, world);
    expect(r.available.map((c) => c.id)).toContain('c3_02_ready');
  });

  it('CONVERGENCIA: la ruta de Vela solo existe si te ganaste su alianza en C2', () => {
    const node = engine.getNode('c3_03');
    const noVela = engine.availableChoices(node, makeCharacter(), makeWorld());
    expect(noVela.available.map((c) => c.id)).not.toContain('c3_03_vela');
    expect(noVela.locked.map((c) => c.id)).toContain('c3_03_vela');

    const withVela = engine.availableChoices(
      node, makeCharacter(), makeWorld({ flags: { servan_vell_arc_open: true, vela_ally: true } })
    );
    expect(withVela.available.map((c) => c.id)).toContain('c3_03_vela');
  });

  it('tres rutas de infiltración por atributos (Agilidad/Fuerza/Carisma 12)', () => {
    const node = engine.getNode('c3_03');
    const agile = makeCharacter({ stats: { ...makeCharacter().stats, agility: 12 } });
    const r = engine.availableChoices(node, agile, makeWorld());
    expect(r.available.map((c) => c.id)).toContain('c3_03_roofs');
    expect(r.available.map((c) => c.id)).not.toContain('c3_03_cellar');
  });

  it('el clímax es decisión dual: contrato vs cría, ambas con consecuencias', () => {
    const node = engine.getNode('c3_05');
    expect(node.choices).toHaveLength(2);
    expect(node.duoText).toBeDefined();

    const contract = engine.choose(node, node.choices[0], makeCharacter(), makeWorld(), 'd-c');
    expect(contract.world.flags.c3_took_contract).toBe(true);
    expect(contract.nextNodeId).toBe('c3_06_contract');

    const cub = engine.choose(node, node.choices[1], makeCharacter(), makeWorld(), 'd-b');
    expect(cub.world.flags.c3_saved_cub).toBe(true);
    expect(cub.nextNodeId).toBe('c3_06_cub');
  });

  it('cada rama deja secuela: contrato → cría cautiva; cría → contrato firmado', () => {
    const rc = engine.enterNode(engine.getNode('c3_06_contract'), makeCharacter(), makeWorld());
    expect(rc.world.flags.cub_still_captive).toBe(true);

    const rb = engine.enterNode(engine.getNode('c3_06_cub'), makeCharacter(), makeWorld());
    expect(rb.world.flags.contract_signed).toBe(true);
    expect(rb.character.titles).toContain('cub_guardian');
  });

  it('el final abre el siguiente arco: Vell sabe que existes', () => {
    const w = makeWorld({ quests: [{ questId: 'quest_winter_fair', status: 'active', progress: {} }] });
    const r = engine.enterNode(engine.getNode('c3_07'), makeCharacter(), w);
    expect(r.world.flags.vell_knows_you_exist).toBe(true);
    expect(r.world.quests.find((q) => q.questId === 'quest_winter_fair')?.status).toBe('completed');
  });

  it('los nodos clave tienen variante dúo (historia de dos almas)', () => {
    const duoNodes = CHAPTER_03.nodes.filter((n) => n.duoText);
    expect(duoNodes.length).toBeGreaterThanOrEqual(3);
    expect(CHAPTER_03.nodes.find((n) => n.id === 'c3_01')?.duoText?.es).toContain('{partner}');
  });
});
