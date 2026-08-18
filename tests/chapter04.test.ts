import { describe, it, expect, beforeEach } from 'vitest';
import { createStoryEngine } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { CHAPTER_04 } from '@/content/story/chapter04';
import { getEnemy, FLAYER } from '@/data/enemies';
import { createCombat, tick } from '@/combat/engine';
import { actionsForCharacter } from '@/data/combatActions';
import { hasPortrait } from '@/ui/portraits';
import type { CharacterState, WorldState } from '@/domain/types';

const rng = (v = 0.5) => () => v;

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'c', templateId: 'thessa', name: 'Alba', gender: 'f', classId: 'knight', goddessId: 'aurelia',
    level: 6, xp: 0, unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
    stats: { strength: 10, intelligence: 8, agility: 8, vitality: 10, luck: 6, willpower: 9, charisma: 8 },
    currentHp: 160, currentMp: 70, skills: ['shield_guard', 'persuasion', 'analyze'],
    inventory: [], gold: 60, titles: [], reputation: {},
    ...overrides
  };
}

function makeWorld(flags: Record<string, boolean | number | string> = {}): WorldState {
  return {
    flags: { servan_vell_arc_open: true, vell_knows_you_exist: true, ...flags },
    discoveredRegions: ['aldea_brumal', 'bosque_susurros', 'ciudad_petra'],
    currentRegionId: 'ciudad_petra', npcRelationships: {}, npcMemory: {}, quests: [], decisions: []
  };
}

describe('Capítulo 4 — La caza de Servan Vell', () => {
  let engine: ReturnType<typeof createStoryEngine>;

  beforeEach(() => {
    engine = createStoryEngine();
  });

  it('valida y ambos finales del C3 enlazan con él', () => {
    expect(() => validateChapter(CHAPTER_04)).not.toThrow();
    const c3end = engine.getNode('c3_07');
    const direct = c3end.choices.find((c) => c.id === 'c3_07_continue')!;
    expect(engine.choose(c3end, direct, makeCharacter(), makeWorld(), 'd1').nextNodeId).toBe('c4_01');
    const ruinsEnd = engine.getNode('c3_ruins_after');
    expect(ruinsEnd.choices.some((c) => c.goto === 'chapter:chapter_04')).toBe(true);
  });

  it('CONVERGENCIA: la ruta del Tribunal exige el contrato O cuchillo+Vela', () => {
    const node = engine.getNode('c4_03');
    // sin pruebas: solo el rescate disponible
    const none = engine.availableChoices(node, makeCharacter(), makeWorld());
    expect(none.available.map((c) => c.id)).toEqual(['c4_03_estate']);
    expect(none.locked.length).toBeGreaterThanOrEqual(2);
    // con el contrato del C3:
    const withContract = engine.availableChoices(node, makeCharacter(), makeWorld({ c3_took_contract: true }));
    expect(withContract.available.map((c) => c.id)).toContain('c4_03_tribunal_contract');
    // con cuchillo + Vela (ruta alternativa):
    const withKnife = engine.availableChoices(
      node, makeCharacter(), makeWorld({ has_serpent_knife: true, vela_ally: true })
    );
    expect(withKnife.available.map((c) => c.id)).toContain('c4_03_tribunal_knife');
  });

  it('la elección de ruta es decisión dual cooperativa', () => {
    const node = engine.getNode('c4_03');
    expect(node.coopEventId).toBe('c4_route_choice');
    expect(node.duoText).toBeDefined();
  });

  it('MEMORIA (§65): solo quien liberó a la guardiana puede llamar a la niebla', () => {
    const node = engine.getNode('c4_est1');
    const hero = engine.availableChoices(node, makeCharacter(), makeWorld({ freed_mist_creature: true }));
    expect(hero.available.map((c) => c.id)).toContain('c4_est1_mist');
    const plain = engine.availableChoices(node, makeCharacter(), makeWorld());
    expect(plain.available.map((c) => c.id)).not.toContain('c4_est1_mist');
    expect(plain.locked.map((c) => c.id)).toContain('c4_est1_mist');
  });

  it('ambas rutas desembocan en el jefe; victoria y derrota crean historia (§21)', () => {
    const boss = engine.getNode('c4_boss');
    expect(boss.combatId).toBe('desollador');
    expect(boss.victoryGoto).toBe('c4_win');
    expect(boss.defeatGoto).toBe('c4_lost');
    const win = engine.enterNode(engine.getNode('c4_win'), makeCharacter(), makeWorld());
    expect(win.character.titles).toContain('vell_hunter');
    expect(win.world.flags.vell_fleeing_south).toBe(true);
    const lost = engine.enterNode(engine.getNode('c4_lost'), makeCharacter(), makeWorld());
    expect(lost.world.flags.captured_by_vell).toBe(true);
    expect(lost.world.flags.vell_fleeing_south).toBe(true); // la caza sigue en ambos casos
    expect(lost.character.currentHp).toBeGreaterThan(0); // sobrevives
  });

  it('el final abre el arco del sur', () => {
    const w = makeWorld();
    w.quests.push({ questId: 'quest_vell_hunt', status: 'active', progress: {} });
    const r = engine.enterNode(engine.getNode('c4_end'), makeCharacter(), w);
    expect(r.world.flags.southern_arc_open).toBe(true);
    expect(r.world.quests.find((q) => q.questId === 'quest_vell_hunt')?.status).toBe('completed');
  });
});

describe('El Desollador — jefe con 3 fases (§14)', () => {
  it('está registrado, con retrato, debilidad al fuego y recompensas', () => {
    const e = getEnemy('desollador');
    expect(e).toBe(FLAYER);
    expect(hasPortrait('desollador')).toBe(true);
    expect(e.weaknesses).toContain('fire');
    expect(e.phases).toHaveLength(2);
    expect(e.rewards.items?.some((i) => i.itemId === 'old_locket')).toBe(true);
  });

  it('fase 2 (red) bajo 60% y desesperación bajo 25%', () => {
    let s = createCombat('desollador', { hp: 200, maxHp: 200, mp: 80, maxMp: 80, stamina: 50 });
    const ALL = actionsForCharacter(['fireball']);
    s.enemyHp = Math.floor(s.enemyMaxHp * 0.5);
    let r = tick(s, 250, 10, 10, ALL, rng());
    expect(r.state.currentPhase).toBe(1);
    expect(r.state.log.some((l) => l.text.es.includes('RED DE ACERO'))).toBe(true);
    r.state.enemyHp = Math.floor(s.enemyMaxHp * 0.2);
    r = tick(r.state, 250, 10, 10, ALL, rng());
    expect(r.state.currentPhase).toBe(2);
    expect(r.state.log.some((l) => l.text.es.includes('MIEDO'))).toBe(true);
  });

  it('todos sus movimientos tienen ventana legible y contramedidas', () => {
    for (const m of [...FLAYER.moves, ...(FLAYER.phases?.flatMap((p) => p.moves) ?? [])]) {
      expect(m.windowMs).toBeGreaterThanOrEqual(2000);
      expect(m.counters.length).toBeGreaterThan(0);
    }
  });
});
