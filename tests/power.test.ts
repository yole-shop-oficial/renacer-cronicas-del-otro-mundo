import { describe, it, expect } from 'vitest';
import {
  bondScore,
  bondLevel,
  bondStatBonuses,
  equipmentStatBonuses,
  effectiveStats,
  combatPower,
  powerBreakdown
} from '@/domain/power';
import { NPCS } from '@/data/world';
import type { CharacterState, WorldState, RelationshipBlock } from '@/domain/types';

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'c', templateId: 'liria', name: 'Alba', gender: 'f', classId: 'mage', goddessId: 'aurelia',
    level: 1, xp: 0,
    unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {},
    stats: { strength: 5, intelligence: 5, agility: 5, vitality: 5, luck: 5, willpower: 5, charisma: 5 },
    currentHp: 100, currentMp: 50, skills: [], inventory: [], gold: 0, titles: [], reputation: {},
    ...overrides
  };
}

function makeWorld(overrides: Partial<WorldState> = {}): WorldState {
  return {
    flags: {}, discoveredRegions: [], currentRegionId: 'aldea_brumal',
    npcRelationships: {}, npcMemory: {}, quests: [], decisions: [],
    ...overrides
  };
}

const rel = (partial: Partial<RelationshipBlock>): RelationshipBlock => ({
  trust: 0, friendship: 0, respect: 0, fear: 0, affection: 0, rivalry: 0, ...partial
});

describe('Sistema de vínculos → poder', () => {
  it('bondScore suma ejes positivos y resta miedo', () => {
    expect(bondScore(rel({ trust: 20, friendship: 15 }))).toBe(35);
    expect(bondScore(rel({ trust: 30, fear: 10 }))).toBe(20);
    expect(bondScore(rel({ fear: 50 }))).toBe(0); // nunca negativo
  });

  it('bondLevel: 1 nivel por cada 20 puntos, máx 5', () => {
    expect(bondLevel(rel({}))).toBe(0);
    expect(bondLevel(rel({ trust: 20 }))).toBe(1);
    expect(bondLevel(rel({ trust: 40, friendship: 25 }))).toBe(3);
    expect(bondLevel(rel({ trust: 100, friendship: 100 }))).toBe(5);
  });

  it('cada NPC potencia SU estadística según el vínculo', () => {
    const bonuses = bondStatBonuses(NPCS, {
      joren: rel({ trust: 25, friendship: 20 }), // nivel 2 → +2 strength
      pip: rel({ friendship: 20 }) // nivel 1 → +1 luck
    });
    expect(bonuses.strength).toBe(2);
    expect(bonuses.luck).toBe(1);
    expect(bonuses.intelligence).toBeUndefined();
  });

  it('el equipo suma stats: espada de hierro da +2 fuerza', () => {
    const c = makeCharacter({
      inventory: [{ itemId: 'iron_sword', quantity: 1, equipped: true }],
      equipment: { weapon: 'iron_sword' }
    });
    expect(equipmentStatBonuses(c).strength).toBe(2);
  });

  it('stats efectivas = base + equipo + vínculos', () => {
    const c = makeCharacter({ equipment: { weapon: 'iron_sword' } });
    const w = makeWorld({ npcRelationships: { joren: rel({ trust: 25, friendship: 20 }) } });
    const eff = effectiveStats(c, NPCS, w);
    expect(eff.strength).toBe(5 + 2 + 2); // base + espada + vínculo Joren nv2
  });

  it('el poder de combate crece con vínculos (las personas te hacen fuerte)', () => {
    const c = makeCharacter();
    const without = combatPower(c, NPCS, makeWorld());
    const withBonds = combatPower(
      c,
      NPCS,
      makeWorld({
        npcRelationships: {
          marta: rel({ trust: 50, friendship: 50 }),
          joren: rel({ trust: 40, friendship: 40 })
        }
      })
    );
    expect(withBonds).toBeGreaterThan(without);
  });

  it('el poder crece con nivel, habilidades y equipo', () => {
    const base = combatPower(makeCharacter(), NPCS, makeWorld());
    const higher = combatPower(makeCharacter({ level: 5 }), NPCS, makeWorld());
    const skilled = combatPower(makeCharacter({ skills: ['fireball', 'analyze'] }), NPCS, makeWorld());
    const equipped = combatPower(makeCharacter({ equipment: { weapon: 'iron_sword' } }), NPCS, makeWorld());
    expect(higher).toBeGreaterThan(base);
    expect(skilled).toBeGreaterThan(base);
    expect(equipped).toBeGreaterThan(base);
  });

  it('powerBreakdown es transparente y suma el total', () => {
    const c = makeCharacter({ level: 3, skills: ['fireball'] });
    const b = powerBreakdown(c, NPCS, makeWorld());
    expect(b.fromStats + b.fromLevel + b.fromSkills).toBe(b.total);
    expect(b.fromLevel).toBe(45);
    expect(b.fromSkills).toBe(8);
  });
});
