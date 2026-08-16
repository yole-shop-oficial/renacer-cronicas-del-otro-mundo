import { describe, it, expect } from 'vitest';
import { deriveStats, applyXp, xpForNextLevel, mergeStats } from '@/domain/stats';
import type { StatBlock } from '@/domain/types';

const base: StatBlock = {
  strength: 5, intelligence: 5, agility: 5, vitality: 5, luck: 5, willpower: 5, charisma: 5
};

describe('Sistema de estadísticas', () => {
  it('deriva todas las estadísticas secundarias', () => {
    const d = deriveStats(base, 1);
    expect(d.hp).toBe(50 + 5 * 8 + 10);
    expect(d.mp).toBe(20 + 5 * 5 + 5 * 3 + 5);
    expect(Object.keys(d)).toHaveLength(9);
  });

  it('sube de nivel al alcanzar la XP requerida', () => {
    const needed = xpForNextLevel(1);
    const r = applyXp(1, 0, needed);
    expect(r.level).toBe(2);
    expect(r.leveledUp).toBe(true);
  });

  it('acumula XP sin subir si no alcanza el umbral', () => {
    const r = applyXp(1, 0, 50);
    expect(r.level).toBe(1);
    expect(r.xp).toBe(50);
    expect(r.leveledUp).toBe(false);
  });

  it('maneja múltiples subidas de nivel de golpe', () => {
    const r = applyXp(1, 0, 10_000);
    expect(r.level).toBeGreaterThan(3);
  });

  it('mergeStats suma bonificaciones de clase/Diosa', () => {
    const merged = mergeStats(base, { strength: 4, vitality: 3 });
    expect(merged.strength).toBe(9);
    expect(merged.vitality).toBe(8);
    expect(merged.luck).toBe(5);
  });
});
