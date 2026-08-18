import { describe, it, expect } from 'vitest';
import {
  splitTaskById,
  createRitual,
  ritualPulse,
  resolveSplit,
  SPLIT_TASKS
} from '@/coop/splitTasks';
import { createStoryEngine } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { CHAPTER_05 } from '@/content/story/chapter05';
import { getEnemy, CORSAIR } from '@/data/enemies';
import { REGIONS } from '@/data/world';
import { poisForRegion } from '@/data/pois';
import type { CharacterState, WorldState } from '@/domain/types';

function makeCharacter(): CharacterState {
  return {
    id: 'c', templateId: 'thessa', name: 'Alba', gender: 'f', classId: 'knight', goddessId: 'aurelia',
    level: 7, xp: 0, unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
    stats: { strength: 11, intelligence: 9, agility: 9, vitality: 11, luck: 7, willpower: 10, charisma: 9 },
    currentHp: 170, currentMp: 80, skills: ['shield_guard'], inventory: [], gold: 80, titles: [], reputation: {}
  };
}

function makeWorld(): WorldState {
  return {
    flags: { southern_arc_open: true }, discoveredRegions: ['ciudad_petra', 'puerto_zafir'],
    currentRegionId: 'puerto_zafir', npcRelationships: {}, npcMemory: {}, quests: [], decisions: []
  };
}

describe('Tareas divididas (§45) — motor puro', () => {
  const def = splitTaskById('zafir_harbor_split');

  it('la definición referencia un combate real y 4 resoluciones', () => {
    expect(getEnemy(def.combatId)).toBe(CORSAIR);
    const outs = Object.values(def.outcomes);
    expect(new Set(outs).size).toBe(4);
  });

  it('el ritual avanza con aciertos y falla con demasiados errores', () => {
    let r = createRitual();
    for (let i = 0; i < def.ritual.steps; i++) r = ritualPulse(r, true, def.ritual);
    expect(r.phase).toBe('success');

    let f = createRitual();
    for (let i = 0; i <= def.ritual.maxMisses; i++) f = ritualPulse(f, false, def.ritual);
    expect(f.phase).toBe('failed');
  });

  it('aciertos y fallos mezclados: sobrevive dentro del margen', () => {
    let r = createRitual();
    r = ritualPulse(r, true, def.ritual);
    r = ritualPulse(r, false, def.ritual); // 1 fallo
    r = ritualPulse(r, true, def.ritual);
    r = ritualPulse(r, false, def.ritual); // 2 fallos (== maxMisses, aún vivo)
    expect(r.phase).toBe('active');
    r = ritualPulse(r, true, def.ritual);
    r = ritualPulse(r, true, def.ritual);
    r = ritualPulse(r, true, def.ritual);
    expect(r.phase).toBe('success');
  });

  it('estados terminales son inmutables', () => {
    let r = createRitual();
    for (let i = 0; i < def.ritual.steps; i++) r = ritualPulse(r, true, def.ritual);
    const after = ritualPulse(r, false, def.ritual);
    expect(after.phase).toBe('success');
  });

  it('LA FUSIÓN (§45): cada combinación lleva a su resolución', () => {
    expect(resolveSplit(def, true, true)).toBe('c5_both_win');
    expect(resolveSplit(def, true, false)).toBe('c5_combat_only');
    expect(resolveSplit(def, false, true)).toBe('c5_ritual_only');
    expect(resolveSplit(def, false, false)).toBe('c5_both_fail');
  });

  it('todas las tareas definidas apuntan a nodos existentes', () => {
    const engine = createStoryEngine();
    for (const task of SPLIT_TASKS) {
      for (const nodeId of Object.values(task.outcomes)) {
        expect(() => engine.getNode(nodeId)).not.toThrow();
      }
    }
  });
});

describe('Capítulo 5 — El puerto de Zafir', () => {
  it('valida, el C4 enlaza con él, y el nodo split está declarado', () => {
    expect(() => validateChapter(CHAPTER_05)).not.toThrow();
    const engine = createStoryEngine();
    const c4end = engine.getNode('c4_end');
    expect(c4end.choices.some((c) => c.goto === 'chapter:chapter_05')).toBe(true);
    const split = engine.getNode('c5_split');
    expect(split.splitTaskId).toBe('zafir_harbor_split');
  });

  it('las 4 resoluciones cuentan historias distintas y ninguna es Game Over (§21)', () => {
    const engine = createStoryEngine();
    const bothWin = engine.enterNode(engine.getNode('c5_both_win'), makeCharacter(), makeWorld());
    expect(bothWin.world.flags.vell_arrested).toBe(true);
    const combatOnly = engine.enterNode(engine.getNode('c5_combat_only'), makeCharacter(), makeWorld());
    expect(combatOnly.world.flags.star_grounded).toBe(true);
    const ritualOnly = engine.enterNode(engine.getNode('c5_ritual_only'), makeCharacter(), makeWorld());
    expect(ritualOnly.world.flags.star_crippled).toBe(true);
    const bothFail = engine.enterNode(engine.getNode('c5_both_fail'), makeCharacter(), makeWorld());
    expect(bothFail.world.flags.vell_escaped_clean).toBe(true);
    expect(bothFail.world.flags.southern_mystery_scarf).toBe(true); // la derrota siembra el futuro
    expect(bothFail.character.currentHp).toBeGreaterThan(0);
  });

  it('Zafir existe como región con 3 puntos de recorrido', () => {
    expect(REGIONS.some((r) => r.id === 'puerto_zafir')).toBe(true);
    expect(poisForRegion('puerto_zafir')).toHaveLength(3);
  });

  it('el Corsario tiene ventanas legibles y truco propio (wet→lightning)', () => {
    for (const m of CORSAIR.moves) {
      expect(m.windowMs).toBeGreaterThanOrEqual(2000);
      expect(m.counters.length).toBeGreaterThan(0);
    }
    expect(CORSAIR.weaknesses).toContain('lightning');
    expect(CORSAIR.moves.some((m) => m.applies?.effect === 'wet')).toBe(true);
  });
});
