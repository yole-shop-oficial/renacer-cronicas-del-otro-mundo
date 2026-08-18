import { describe, it, expect } from 'vitest';
import { hasPortrait } from '@/ui/portraits';
import { NPCS } from '@/data/world';
import { ENEMIES, TWIN_SENTINEL } from '@/data/enemies';
import { createStoryEngine } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { CHAPTER_02 } from '@/content/story/chapter02';

describe('Retratos (§79)', () => {
  it('todos los NPC con biografía tienen retrato', () => {
    for (const npc of NPCS) {
      expect(hasPortrait(npc.id), `falta retrato de ${npc.id}`).toBe(true);
    }
  });

  it('todos los enemigos (incluido el Centinela) tienen retrato', () => {
    for (const e of [...ENEMIES, TWIN_SENTINEL]) {
      expect(hasPortrait(e.id), `falta retrato de ${e.id}`).toBe(true);
    }
  });

  it('la Diosa tiene retrato; ids desconocidos no', () => {
    expect(hasPortrait('goddess')).toBe(true);
    expect(hasPortrait('nadie')).toBe(false);
  });
});

describe('Combate del Furtivo en C2 (ruta directa)', () => {
  it('el capítulo valida y la ruta directa lleva al combate', () => {
    expect(() => validateChapter(CHAPTER_02)).not.toThrow();
    const engine = createStoryEngine();
    const direct = engine.getNode('c2_05_direct');
    expect(direct.choices[0].goto).toBe('c2_poacher');
    const fight = engine.getNode('c2_poacher');
    expect(fight.combatId).toBe('furtivo_sierpe');
    expect(fight.victoryGoto).toBe('c2_poacher_after');
    expect(fight.defeatGoto).toBe('c2_poacher_defeat');
    expect(fight.duoText?.es).toContain('{partner}');
  });

  it('victoria deja prueba (cuchillo); derrota cuesta las crías (§21)', () => {
    const engine = createStoryEngine();
    const win = engine.getNode('c2_poacher_after');
    expect(win.onEnter.some((e) => e.kind === 'setFlag' && e.key === 'has_serpent_knife')).toBe(true);
    const loss = engine.getNode('c2_poacher_defeat');
    expect(loss.onEnter.some((e) => e.kind === 'setFlag' && e.key === 'cubs_shipped_away')).toBe(true);
    expect(loss.onEnter.some((e) => e.kind === 'heal')).toBe(true); // sobrevives
    // la derrota salta el dilema del muelle: va directo al epílogo con Lu
    expect(loss.choices[0].goto).toBe('c2_08');
  });

  it('las rutas de sigilo/magia siguen evitando el combate', () => {
    const engine = createStoryEngine();
    expect(engine.getNode('c2_05_ledger').choices[0].goto).toBe('c2_06');
    expect(engine.getNode('c2_05_wards').choices[0].goto).toBe('c2_06');
  });
});
