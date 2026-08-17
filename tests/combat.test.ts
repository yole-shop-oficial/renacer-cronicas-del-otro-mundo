import { describe, it, expect } from 'vitest';
import { createCombat, act, react, tick, tryCoopCombo } from '@/combat/engine';
import { actionById, actionsForCharacter } from '@/data/combatActions';
import { ENEMIES, getEnemy } from '@/data/enemies';
import { COMBO_RULES } from '@/combat/combos';
import type { CombatState } from '@/combat/types';

const rng = (v = 0.5) => () => v;

function newCombat(enemyId = 'lobo_famelico'): CombatState {
  return createCombat(enemyId, { hp: 100, maxHp: 100, mp: 50, maxMp: 50, stamina: 40 });
}

const ALL = actionsForCharacter([
  'fireball', 'power_strike', 'shield_bash', 'heal', 'meteor', 'arcane_missile'
]);

describe('Combat Engine — comandos (§9)', () => {
  it('el ataque básico hace daño con varianza controlada', () => {
    const s = newCombat();
    const { state } = act(s, actionById('basic_attack')!, 10, 5, rng());
    expect(state.enemyHp).toBeLessThan(s.enemyHp);
    expect(state.cooldowns['basic_attack']).toBeGreaterThan(0);
  });

  it('respeta cooldowns, MP y stamina', () => {
    const s = newCombat();
    const fireball = actionById('fireball')!;
    // sin MP suficiente:
    const poor = { ...s, playerMp: 2 };
    expect(act(poor, fireball, 5, 10, rng()).state.enemyHp).toBe(s.enemyHp);
    // en cooldown:
    const cooled = { ...s, cooldowns: { fireball: 2000 } };
    expect(act(cooled, fireball, 5, 10, rng()).state.enemyHp).toBe(s.enemyHp);
  });

  it('debilidad elemental multiplica el daño (§11): fuego vs lobo', () => {
    const s = newCombat('lobo_famelico'); // débil al fuego
    const missile = { ...actionById('arcane_missile')!, castMs: 0 };
    const fire = { ...actionById('fireball')!, castMs: 0, basePower: missile.basePower, applies: undefined };
    const dFire = s.enemyHp - act(s, fire, 5, 10, rng()).state.enemyHp;
    const dLight = s.enemyHp - act(s, missile, 5, 10, rng()).state.enemyHp;
    expect(dFire).toBeGreaterThan(dLight);
  });

  it('hechizo de carga (§16): meteoro canaliza y golpea al terminar', () => {
    const s = newCombat();
    const meteor = actionById('meteor')!;
    const { state: casting } = act(s, meteor, 5, 12, rng());
    expect(casting.casting?.actionId).toBe('meteor');
    expect(casting.enemyHp).toBe(s.enemyHp); // aún no golpea
    // avanzar 4s:
    let cur = casting;
    for (let i = 0; i < 20; i++) {
      cur = tick(cur, 250, 5, 12, ALL, rng()).state;
    }
    expect(cur.casting).toBeNull();
    expect(cur.enemyHp).toBeLessThan(s.enemyHp);
  });

  it('analizar revela información progresiva (§15)', () => {
    const s = newCombat();
    const analyze = actionById('analyze_combat')!;
    const r1 = act(s, analyze, 5, 5, rng()).state;
    expect(r1.analyzeLevel).toBe(1);
    expect(r1.log.some((l) => l.text.es.includes('famélico'))).toBe(true);
  });
});

describe('Combat Engine — IA enemiga y reacciones (§8, §64)', () => {
  it('el enemigo telegrafia, espera la ventana y golpea', () => {
    let s = newCombat();
    // avanzar hasta que telegrafíe (pace 5200ms)
    for (let i = 0; i < 22 && !s.incoming; i++) {
      s = tick(s, 250, 5, 5, ALL, rng(0.1)).state;
    }
    expect(s.incoming).not.toBeNull();
    const hpBefore = s.playerHp;
    // dejar pasar la ventana sin reaccionar:
    for (let i = 0; i < 16 && s.incoming; i++) {
      s = tick(s, 250, 5, 5, ALL, rng(0.9)).state;
    }
    expect(s.playerHp).toBeLessThan(hpBefore);
  });

  it('la reacción correcta evita el golpe', () => {
    let s = newCombat();
    for (let i = 0; i < 22 && !s.incoming; i++) {
      s = tick(s, 250, 5, 5, ALL, rng(0.1)).state;
    }
    expect(s.incoming).not.toBeNull();
    const hpBefore = s.playerHp;
    s = react(s, 'dodge').state; // lf_bite se esquiva
    expect(s.incoming).toBeNull();
    // avanzar: no debe llegar daño de ese ataque
    s = tick(s, 500, 5, 5, ALL, rng(0.9)).state;
    expect(s.playerHp).toBe(hpBefore);
  });

  it('victoria al llegar el HP enemigo a 0 (§20)', () => {
    let s = newCombat();
    s.enemyHp = 5;
    s = act(s, actionById('power_strike')!, 20, 5, rng()).state;
    const r = tick(s, 250, 5, 5, ALL, rng());
    expect(r.state.phase).toBe('victory');
    expect(r.events.some((e) => e.type === 'COMBAT_WON')).toBe(true);
  });
});

describe('Jefes con fases (§14)', () => {
  it('el espectro cambia de fase bajo 50% de HP', () => {
    let s = newCombat('espectro_velo');
    s.enemyHp = Math.floor(s.enemyMaxHp * 0.4);
    const r = tick(s, 250, 5, 5, ALL, rng());
    expect(r.state.currentPhase).toBe(1);
    expect(r.events.some((e) => e.type === 'ENEMY_PHASE_CHANGED')).toBe(true);
    expect(r.state.log.some((l) => l.text.es.includes('DOS rostros'))).toBe(true);
  });

  it('todos los enemigos están bien formados (§13)', () => {
    for (const e of ENEMIES) {
      expect(e.maxHp).toBeGreaterThan(0);
      expect(e.moves.length).toBeGreaterThan(0);
      expect(e.analyzeReveals.length).toBeGreaterThan(0);
      expect(e.rewards.xp).toBeGreaterThan(0);
      for (const m of [...e.moves, ...(e.phases?.flatMap((p) => p.moves) ?? [])]) {
        expect(m.windowMs).toBeGreaterThanOrEqual(2000); // ventana legible (§65)
        expect(m.counters.length).toBeGreaterThan(0);
        expect(m.telegraph.es).toBeTruthy();
        expect(m.impact.en).toBeTruthy();
      }
    }
  });
});

describe('Interacciones elementales y combos (§11, §42, §67)', () => {
  it('rayo sobre enemigo empapado aturde', () => {
    let s = newCombat('furtivo_sierpe');
    s.enemyStatuses = [{ effect: 'wet', remainingMs: 5000, power: 1 }];
    const bolt = { ...actionById('arcane_missile')!, element: 'lightning' as const };
    s = act(s, bolt, 5, 10, rng()).state;
    expect(s.enemyStatuses.some((st) => st.effect === 'stun')).toBe(true);
  });

  it('combo cooperativo fuego+viento dispara el tornado', () => {
    const s = newCombat();
    const { state, comboId } = tryCoopCombo(s, 'fire', 'wind', rng());
    expect(comboId).toBe('combo_firestorm');
    expect(state.enemyHp).toBeLessThan(s.enemyHp);
    expect(state.enemyStatuses.some((st) => st.effect === 'burn')).toBe(true);
  });

  it('elementos sin regla no comban', () => {
    const s = newCombat();
    expect(tryCoopCombo(s, 'physical', 'poison', rng()).comboId).toBeNull();
  });

  it('las reglas de combo están bien formadas', () => {
    const ids = new Set(COMBO_RULES.map((r) => r.id));
    expect(ids.size).toBe(COMBO_RULES.length);
    for (const r of COMBO_RULES) {
      expect(r.bonusDamage).toBeGreaterThan(0);
      expect(r.text.es).toBeTruthy();
      expect(r.text.en).toBeTruthy();
    }
  });
});

describe('Estados por tick (§12)', () => {
  it('la quemadura hace daño por segundo y expira', () => {
    let s = newCombat();
    s.enemyStatuses = [{ effect: 'burn', remainingMs: 2100, power: 5 }];
    const hp0 = s.enemyHp;
    for (let i = 0; i < 10; i++) s = tick(s, 250, 5, 5, ALL, rng(0.9)).state;
    expect(s.enemyHp).toBeLessThan(hp0);
    expect(s.enemyStatuses.some((st) => st.effect === 'burn')).toBe(false); // expiró
  });

  it('el silencio bloquea hechizos pero no ataques', () => {
    let s = newCombat();
    s.playerStatuses = [{ effect: 'silence', remainingMs: 5000, power: 1 }];
    const fire = actionById('fireball')!;
    expect(act(s, fire, 5, 10, rng()).state.playerMp).toBe(s.playerMp); // no gastó
    const atk = act(s, actionById('basic_attack')!, 10, 5, rng()).state;
    expect(atk.enemyHp).toBeLessThan(s.enemyHp);
  });

  it('getEnemy lanza con id desconocido', () => {
    expect(() => getEnemy('no_existe')).toThrow();
  });
});
