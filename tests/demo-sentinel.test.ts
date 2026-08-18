import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import { createDemoSave, isDemoSave, DEMO_GAME_ID } from '@/services/demo';
import { saveGameLocally } from '@/state/persistence';
import { db } from '@/services/localdb';
import { getEnemy, TWIN_SENTINEL } from '@/data/enemies';
import { createCombat, tick, tryCoopCombo } from '@/combat/engine';
import { actionsForCharacter } from '@/data/combatActions';
import { createStoryEngine } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { CHAPTER_03 } from '@/content/story/chapter03';

const rng = (v = 0.5) => () => v;

describe('Modo demo (§97)', () => {
  it('crea una partida jugable de nivel alto', () => {
    const demo = createDemoSave();
    expect(isDemoSave(demo)).toBe(true);
    expect(demo.character.level).toBeGreaterThanOrEqual(5);
    expect(demo.character.skills).toContain('meteor');
    expect(demo.world.discoveredRegions.length).toBeGreaterThanOrEqual(3);
  });

  it('NUNCA se persiste: los datos reales quedan intactos', async () => {
    await db.saves.clear();
    await saveGameLocally(createDemoSave());
    expect(await db.saves.count()).toBe(0);
    expect(await db.saves.get(DEMO_GAME_ID)).toBeUndefined();
  });
});

describe('Centinela Gemelo — encuentro para dos (§104)', () => {
  it('está registrado y tiene 3 fases de mecánica asimétrica', () => {
    const e = getEnemy('centinela_gemelo');
    expect(e).toBe(TWIN_SENTINEL);
    expect(e.phases).toHaveLength(2);
    expect(e.resistances).toContain('physical'); // fase 1: piedra teme magia
    expect(e.analyzeReveals.some((r) => r.es.includes('COMBO'))).toBe(true);
    expect(e.rewards.items?.some((i) => i.itemId === 'goddess_tear')).toBe(true);
  });

  it('cambia a Escudo de Espejo bajo 66% y a frenesí bajo 33%', () => {
    let s = createCombat('centinela_gemelo', { hp: 200, maxHp: 200, mp: 100, maxMp: 100, stamina: 50 });
    const ALL = actionsForCharacter(['fireball']);
    s.enemyHp = Math.floor(s.enemyMaxHp * 0.5);
    let r = tick(s, 250, 10, 10, ALL, rng());
    expect(r.state.currentPhase).toBe(1);
    expect(r.state.log.some((l) => l.text.es.includes('ESPEJO'))).toBe(true);
    r.state.enemyHp = Math.floor(s.enemyMaxHp * 0.2);
    r = tick(r.state, 250, 10, 10, ALL, rng());
    expect(r.state.currentPhase).toBe(2);
    expect(r.state.log.some((l) => l.text.es.includes('COMBOS'))).toBe(true);
  });

  it('los combos elementales lo castigan en la fase final', () => {
    let s = createCombat('centinela_gemelo', { hp: 200, maxHp: 200, mp: 100, maxMp: 100, stamina: 50 });
    s.enemyHp = 60;
    const { state, comboId } = tryCoopCombo(s, 'ice', 'lightning', rng());
    expect(comboId).toBe('combo_frozen_field');
    expect(state.enemyHp).toBeLessThan(60);
    expect(state.enemyStatuses.some((st) => st.effect === 'stun')).toBe(true);
  });

  it('el capítulo 3 enlaza el epílogo: victoria consagra, derrota aconseja volver con otra mano', () => {
    expect(() => validateChapter(CHAPTER_03)).not.toThrow();
    const engine = createStoryEngine();
    const node = engine.getNode('c3_ruins');
    expect(node.combatId).toBe('centinela_gemelo');
    expect(node.victoryGoto).toBe('c3_ruins_after');
    expect(node.defeatGoto).toBe('c3_ruins_defeat');
    expect(node.duoText?.es).toContain('{partner}');
    const after = engine.getNode('c3_ruins_after');
    expect(after.onEnter.some((e) => e.kind === 'grantTitle' && e.key === 'sentinel_bane')).toBe(true);
    const defeat = engine.getNode('c3_ruins_defeat');
    expect(defeat.text.es).toContain('otra mano');
  });
});
