import { describe, it, expect } from 'vitest';
import { REUNION_SCENES, reunionForRegion } from '@/coop/reunions';
import { SPECIAL_DISCORDS, findSpecialDiscord } from '@/coop/specialDiscords';
import { createStoryEngine } from '@/content/story';
import { renderStoryText } from '@/engine/text';
import { REGIONS } from '@/data/world';

describe('Eventos de reencuentro', () => {
  it('hay escena de reencuentro en las regiones principales', () => {
    const covered = REUNION_SCENES.map((r) => r.regionId);
    expect(covered).toContain('aldea_brumal');
    expect(covered).toContain('bosque_susurros');
    expect(covered).toContain('ciudad_petra');
    expect(covered).toContain('templo_alba');
    expect(covered).toContain('ruinas_veloran');
  });

  it('cada escena referencia una región real y tiene ambos puntos de vista', () => {
    const regionIds = new Set(REGIONS.map((r) => r.id));
    for (const scene of REUNION_SCENES) {
      expect(regionIds.has(scene.regionId)).toBe(true);
      // Ambos textos, en ambos idiomas, no vacíos:
      for (const text of [scene.textDefiant, scene.textWinner]) {
        expect(text.es.length).toBeGreaterThan(50);
        expect(text.en.length).toBeGreaterThan(50);
        expect(text.es).toContain('{partner}');
      }
      expect(scene.onReunite.length).toBeGreaterThan(0);
    }
  });

  it('el marcador {partner} y el género se renderizan en los textos', () => {
    const scene = reunionForRegion('aldea_brumal')!;
    const rendered = renderStoryText(scene.textDefiant.es, {
      name: 'Alba',
      gender: 'f',
      partner: 'Kael'
    });
    expect(rendered).toContain('Kael');
    expect(rendered).not.toContain('{partner}');
    expect(rendered).not.toMatch(/\{[^}]*\|[^}]*\}/); // sin marcadores sin resolver
  });

  it('el reencuentro en el Templo del Alba redime la Marca del Destino', () => {
    const temple = reunionForRegion('templo_alba')!;
    const kinds = temple.onReunite.map((e) => e.kind);
    expect(kinds).toContain('changeStat'); // devuelve la suerte
    expect(
      temple.onReunite.some(
        (e) => e.kind === 'setFlag' && e.key === 'marca_del_destino_redimida'
      )
    ).toBe(true);
  });

  it('región sin escena devuelve null (no rompe)', () => {
    expect(reunionForRegion('tierras_ignotas')).toBeNull();
  });
});

describe('Discordias especiales', () => {
  it('todas referencian nodos y elecciones reales del contenido', () => {
    const engine = createStoryEngine();
    for (const d of SPECIAL_DISCORDS) {
      const node = engine.getNode(d.nodeId); // lanza si no existe
      const choiceIds = node.choices.map((c) => c.id);
      expect(choiceIds).toContain(d.pair[0]);
      expect(choiceIds).toContain(d.pair[1]);
      expect(d.pair[0]).not.toBe(d.pair[1]);
      expect(d.text.es.length).toBeGreaterThan(40);
      expect(d.text.en.length).toBeGreaterThan(40);
    }
  });

  it('la búsqueda es simétrica: (a,b) === (b,a)', () => {
    const ab = findSpecialDiscord('c2_06', 'c2_06_free_cubs', 'c2_06_follow_leader');
    const ba = findSpecialDiscord('c2_06', 'c2_06_follow_leader', 'c2_06_free_cubs');
    expect(ab).not.toBeNull();
    expect(ab).toBe(ba);
  });

  it('cubre las grandes discordias de los capítulos 1-2-3', () => {
    // C1: acero vs palabra ante la criatura
    expect(findSpecialDiscord('c1_05', 'c1_05_attack', 'c1_05_talk')).not.toBeNull();
    // C1: llevar a Pip o ir sola
    expect(findSpecialDiscord('c1_pip_offer', 'c1_pip_offer_yes', 'c1_pip_offer_no')).not.toBeNull();
    // C2: crías vs líder
    expect(findSpecialDiscord('c2_06', 'c2_06_free_cubs', 'c2_06_follow_leader')).not.toBeNull();
    // C2: confesar o callar ante Vela
    expect(findSpecialDiscord('c2_guardpost', 'c2_vela_give_admit', 'c2_vela_give_hide')).not.toBeNull();
    // C3: contrato vs cría
    expect(findSpecialDiscord('c3_05', 'c3_05_contract', 'c3_05_cub')).not.toBeNull();
    // C3: las tres rutas de infiltración entre sí
    expect(findSpecialDiscord('c3_03', 'c3_03_roofs', 'c3_03_cellar')).not.toBeNull();
    expect(findSpecialDiscord('c3_03', 'c3_03_roofs', 'c3_03_door')).not.toBeNull();
    expect(findSpecialDiscord('c3_03', 'c3_03_cellar', 'c3_03_door')).not.toBeNull();
  });

  it('combinación sin texto especial devuelve null (usa la genérica)', () => {
    expect(findSpecialDiscord('c1_05', 'c1_05_analyze', 'c1_05_flee')).toBeNull();
  });
});
