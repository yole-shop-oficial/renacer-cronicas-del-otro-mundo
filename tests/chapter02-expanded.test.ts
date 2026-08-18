import { describe, it, expect, beforeEach } from 'vitest';
import { createStoryEngine } from '@/content/story';
import { validateChapter } from '@/engine/schema';
import { CHAPTER_02 } from '@/content/story/chapter02';
import type { CharacterState, WorldState } from '@/domain/types';

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'c', templateId: 'mika', name: 'Alba', gender: 'f', classId: 'rogue', goddessId: 'sylvane',
    level: 2, xp: 0,
    unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
    stats: { strength: 3, intelligence: 4, agility: 8, vitality: 4, luck: 6, willpower: 4, charisma: 4 },
    currentHp: 100, currentMp: 40,
    skills: ['stealth', 'analyze', 'persuasion'],
    inventory: [], gold: 20, titles: [], reputation: {},
    ...overrides
  };
}

function makeWorld(overrides: Partial<WorldState> = {}): WorldState {
  return {
    flags: {}, discoveredRegions: ['aldea_brumal', 'bosque_susurros'],
    currentRegionId: 'bosque_susurros', npcRelationships: {}, npcMemory: {},
    quests: [], decisions: [],
    ...overrides
  };
}

describe('Capítulo 2 ampliado — árbol de decisiones en Petra', () => {
  let engine: ReturnType<typeof createStoryEngine>;

  beforeEach(() => {
    engine = createStoryEngine();
  });

  it('valida el capítulo ampliado (saltos íntegros)', () => {
    expect(() => validateChapter(CHAPTER_02)).not.toThrow();
  });

  it('la historia de Lu sube amistad+confianza y ella lo recuerda', () => {
    const r = engine.enterNode(engine.getNode('c2_lu_story'), makeCharacter(), makeWorld());
    expect(r.world.npcRelationships.vendedora_lu.friendship).toBe(15);
    expect(r.world.npcMemory.vendedora_lu).toContain('player_asked_about_lu_life');
  });

  it('el paseo por Petra ofrece taberna, guardia y leer la carta', () => {
    const node = engine.getNode('c2_stroll');
    const opts = engine.availableChoices(node, makeCharacter(), makeWorld());
    const ids = opts.available.map((c) => c.id);
    expect(ids).toContain('c2_stroll_tavern');
    expect(ids).toContain('c2_stroll_guard');
    expect(ids).toContain('c2_stroll_letter');
  });

  it('abrir la carta de Bren deja huella permanente (el sello no se repara)', () => {
    const r = engine.enterNode(engine.getNode('c2_letter'), makeCharacter(), makeWorld());
    expect(r.world.flags.opened_bren_letter).toBe(true);
    // Con la carta abierta, la opción de leerla desaparece del paseo:
    const stroll = engine.availableChoices(engine.getNode('c2_stroll'), r.character, r.world);
    expect(stroll.available.map((c) => c.id)).not.toContain('c2_stroll_letter');
  });

  it('con Vela: entregar sellada = alianza total; admitir = respeto; ocultar = desconfianza', () => {
    const vela = engine.getNode('c2_guardpost');

    // Carta intacta → solo la opción sellada
    const sealed = engine.availableChoices(vela, makeCharacter(), makeWorld());
    expect(sealed.available.map((c) => c.id)).toContain('c2_vela_give_sealed');
    expect(sealed.available.map((c) => c.id)).not.toContain('c2_vela_give_admit');

    // Carta abierta → admitir u ocultar
    const openedWorld = makeWorld({ flags: { opened_bren_letter: true } });
    const opened = engine.availableChoices(vela, makeCharacter(), openedWorld);
    const ids = opened.available.map((c) => c.id);
    expect(ids).toContain('c2_vela_give_admit');
    expect(ids).toContain('c2_vela_give_hide');
    expect(ids).not.toContain('c2_vela_give_sealed');

    // Consecuencias divergentes
    const rSealed = engine.enterNode(engine.getNode('c2_vela_sealed'), makeCharacter(), makeWorld());
    expect(rSealed.world.flags.vela_ally).toBe(true);
    expect(rSealed.world.npcRelationships.sargento_vela.trust).toBe(20);

    const rLie = engine.enterNode(engine.getNode('c2_vela_lie'), makeCharacter(), makeWorld());
    expect(rLie.world.flags.vela_distrusts).toBe(true);
    expect(rLie.world.npcRelationships.sargento_vela.trust).toBe(-15);
    expect(rLie.world.npcMemory.sargento_vela).toContain('player_lied_about_seal');
  });

  it('la taberna reacciona a tu fama: liberador vs desconocido', () => {
    const tavern = engine.getNode('c2_tavern');
    const famed = engine.availableChoices(
      tavern, makeCharacter(), makeWorld({ flags: { freed_mist_creature: true } })
    );
    expect(famed.available.map((c) => c.id)).toContain('c2_tavern_famed_approach');
    expect(famed.available.map((c) => c.id)).not.toContain('c2_tavern_normal_approach');

    const unknown = engine.availableChoices(tavern, makeCharacter(), makeWorld());
    expect(unknown.available.map((c) => c.id)).toContain('c2_tavern_normal_approach');
  });

  it('escuchar con sigilo revela la corrupción de la guardia', () => {
    const r = engine.enterNode(engine.getNode('c2_tavern_listen'), makeCharacter(), makeWorld());
    expect(r.world.flags.knows_guard_corrupt).toBe(true);
    expect(r.world.flags.heard_hunters_serpent).toBe(true);
  });

  it('el evento del muelle sigue siendo decisión dual cooperativa', () => {
    const node = engine.getNode('c2_06');
    expect(node.coopEventId).toBe('c2_pier_choice');
    expect(node.choices).toHaveLength(2);
  });
});
