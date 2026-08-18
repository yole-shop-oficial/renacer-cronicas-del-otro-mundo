import { describe, it, expect } from 'vitest';
import { applyEffect } from '@/engine/effects';
import { xpForNextLevel } from '@/domain/stats';
import { treeForClass, canLearnNode, treeNodeById } from '@/data/skilltree';
import { NPC_QUESTS } from '@/data/npcQuests';
import { CLASSES } from '@/data/classes';
import { ITEMS } from '@/data/items';
import type { CharacterState, WorldState } from '@/domain/types';

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'c', templateId: 'liria', name: 'Alba', gender: 'f', classId: 'warrior', goddessId: 'ferra',
    level: 1, xp: 0,
    unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
    stats: { strength: 5, intelligence: 5, agility: 5, vitality: 5, luck: 5, willpower: 5, charisma: 5 },
    currentHp: 100, currentMp: 50, skills: [], inventory: [], gold: 0, titles: [], reputation: {},
    ...overrides
  };
}

const world = (): WorldState => ({
  flags: {}, discoveredRegions: [], currentRegionId: 'aldea_brumal',
  npcRelationships: {}, npcMemory: {}, quests: [], decisions: []
});

describe('Progresión: +10 puntos de atributo y +1 de habilidad por nivel', () => {
  it('subir un nivel otorga 10 puntos de atributo y 1 de habilidad', () => {
    const c = makeCharacter();
    const r = applyEffect({ kind: 'gainXp', amount: xpForNextLevel(1) }, c, world());
    expect(r.character.level).toBe(2);
    expect(r.character.unspentPoints).toBe(10);
    expect(r.character.skillPoints).toBe(1);
    expect(r.log.some((l) => l.key === 'log.pointsGained')).toBe(true);
  });

  it('subir varios niveles de golpe acumula los puntos', () => {
    const c = makeCharacter();
    const r = applyEffect({ kind: 'gainXp', amount: 10_000 }, c, world());
    const levels = r.character.level - 1;
    expect(r.character.unspentPoints).toBe(levels * 10);
    expect(r.character.skillPoints).toBe(levels);
  });
});

describe('Árbol de habilidades', () => {
  it('cada clase tiene su árbol: 3 ramas × 3 niveles = 9 nodos', () => {
    for (const cls of CLASSES) {
      const nodes = treeForClass(cls.id);
      expect(nodes).toHaveLength(9);
      const branches = new Set(nodes.map((n) => n.branch));
      expect(branches.size).toBe(3);
    }
  });

  it('los nodos de tier 2+ requieren el nodo anterior', () => {
    const node2 = treeNodeById('warrior_fuerza_2');
    expect(node2.requiresNode).toBe('warrior_fuerza_1');

    const noPrev = canLearnNode(node2, { level: 10, skillPoints: 10, learnedNodes: [] });
    expect(noPrev.ok).toBe(false);
    expect(noPrev.reason).toBe('requires');

    const withPrev = canLearnNode(node2, { level: 10, skillPoints: 10, learnedNodes: ['warrior_fuerza_1'] });
    expect(withPrev.ok).toBe(true);
  });

  it('exige nivel y puntos suficientes', () => {
    const node = treeNodeById('mage_arcano_1');
    expect(canLearnNode(node, { level: 1, skillPoints: 5, learnedNodes: [] }).reason).toBe('level');
    expect(canLearnNode(node, { level: 5, skillPoints: 0, learnedNodes: [] }).reason).toBe('points');
    expect(canLearnNode(node, { level: 5, skillPoints: 1, learnedNodes: [] }).ok).toBe(true);
  });

  it('no se puede aprender dos veces', () => {
    const node = treeNodeById('rogue_sombra_1');
    const r = canLearnNode(node, { level: 5, skillPoints: 5, learnedNodes: ['rogue_sombra_1'] });
    expect(r.reason).toBe('learned');
  });
});

describe('Misiones de NPC', () => {
  it('todas las misiones referencian NPC y recompensas válidas', () => {
    const itemIds = new Set(ITEMS.map((i) => i.id));
    for (const q of NPC_QUESTS) {
      expect(q.requiredLevel).toBeGreaterThanOrEqual(1);
      for (const reward of q.rewards) {
        if (reward.kind === 'addItem') {
          expect(itemIds.has(reward.key ?? '')).toBe(true);
        }
      }
    }
  });

  it('hay misiones con requisitos de nivel, poder y vínculo escalonados', () => {
    expect(NPC_QUESTS.some((q) => q.requiredPower === 0)).toBe(true);
    expect(NPC_QUESTS.some((q) => q.requiredPower >= 200)).toBe(true);
    expect(NPC_QUESTS.some((q) => q.requiredBondLevel >= 2)).toBe(true);
  });
});

describe('Equipamiento', () => {
  it('los objetos equipables declaran slot válido', () => {
    const equipables = ITEMS.filter((i) => i.slot);
    expect(equipables.length).toBeGreaterThanOrEqual(8);
    for (const item of equipables) {
      expect(['weapon', 'armor', 'accessory']).toContain(item.slot);
    }
  });
});
