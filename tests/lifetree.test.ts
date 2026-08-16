import { describe, it, expect } from 'vitest';
import { createStoryEngine, FIRST_NODE_ID } from '@/content/story';
import type { CharacterState, WorldState } from '@/domain/types';

/**
 * El Árbol de la Vida reconstruye el libro desde world.decisions.
 * Estos tests verifican la propiedad clave: el recorrido registrado
 * reproduce EXACTAMENTE el camino vivido, y nada más (el futuro sellado).
 */

function makeCharacter(): CharacterState {
  return {
    id: 'c', templateId: 'liria', name: 'Alba', gender: 'f', classId: 'mage', goddessId: 'aurelia',
    level: 1, xp: 0,
    unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {},
    stats: { strength: 3, intelligence: 10, agility: 5, vitality: 4, luck: 5, willpower: 6, charisma: 5 },
    currentHp: 100, currentMp: 50, skills: ['analyze', 'persuasion'],
    inventory: [], gold: 10, titles: [], reputation: {}
  };
}

function makeWorld(): WorldState {
  return {
    flags: {}, discoveredRegions: ['aldea_brumal'], currentRegionId: 'aldea_brumal',
    npcRelationships: {}, npcMemory: {}, quests: [], decisions: []
  };
}

describe('Árbol de la Vida — event log como libro', () => {
  it('cada decisión registra nodo + elección + timestamp, en orden', () => {
    const engine = createStoryEngine();
    let character = makeCharacter();
    let world = makeWorld();

    // Vivir tres páginas del prólogo:
    const path = [
      { node: 'pro_01', choice: 'pro_01_photo' },
      { node: 'pro_02_photo', choice: 'pro_02p_go' },
      { node: 'pro_03', choice: 'pro_03_open' }
    ];
    let nodeId = FIRST_NODE_ID;
    for (const [i, step] of path.entries()) {
      const node = engine.getNode(step.node);
      const choice = node.choices.find((c) => c.id === step.choice)!;
      const r = engine.choose(node, choice, character, world, `d-${i}`);
      character = r.character;
      world = r.world;
      nodeId = r.nextNodeId;
    }

    // El libro tiene exactamente 3 páginas vividas, en orden causal:
    expect(world.decisions).toHaveLength(3);
    expect(world.decisions.map((d) => d.nodeId)).toEqual(['pro_01', 'pro_02_photo', 'pro_03']);
    expect(world.decisions.map((d) => d.choiceId)).toEqual([
      'pro_01_photo', 'pro_02p_go', 'pro_03_open'
    ]);
    // Y la página actual (pro_04) aún no tiene decisión: futuro sellado.
    expect(nodeId).toBe('pro_04');
    expect(world.decisions.some((d) => d.nodeId === 'pro_04')).toBe(false);
  });

  it('cada decisión del libro puede resolverse a su texto original', () => {
    const engine = createStoryEngine();
    const world = makeWorld();
    const character = makeCharacter();
    const node = engine.getNode('pro_01');
    const choice = node.choices[0];
    const r = engine.choose(node, choice, character, world, 'd-x');

    // Reconstrucción tipo LifeTree: decisión → nodo → texto y elección.
    for (const d of r.world.decisions) {
      const n = engine.getNode(d.nodeId);
      expect(n.text.es.length).toBeGreaterThan(0);
      const c = n.choices.find((c) => c.id === d.choiceId);
      expect(c).toBeDefined();
      expect(c!.text.es.length).toBeGreaterThan(0);
    }
  });
});
