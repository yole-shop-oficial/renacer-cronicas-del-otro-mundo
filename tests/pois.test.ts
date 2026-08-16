import { describe, it, expect } from 'vitest';
import { POIS, poisForRegion } from '@/data/pois';
import { REGIONS } from '@/data/world';
import { ITEMS } from '@/data/items';

describe('Puntos de recorrido del mapa', () => {
  it('todas las regiones descubribles tienen puntos', () => {
    for (const region of REGIONS.filter((r) => r.kind !== 'unknown' && r.id !== 'tierras_ignotas')) {
      if (region.id === 'ruinas_veloran' || region.id === 'templo_alba') continue; // avanzadas: opcional
      expect(poisForRegion(region.id).length).toBeGreaterThan(0);
    }
  });

  it('los puntos referencian regiones y objetos existentes', () => {
    const regionIds = new Set(REGIONS.map((r) => r.id));
    const itemIds = new Set(ITEMS.map((i) => i.id));
    for (const poi of POIS) {
      expect(regionIds.has(poi.regionId)).toBe(true);
      expect(poi.x).toBeGreaterThanOrEqual(0);
      expect(poi.x).toBeLessThanOrEqual(100);
      expect(poi.y).toBeGreaterThanOrEqual(0);
      expect(poi.y).toBeLessThanOrEqual(100);
      for (const action of poi.actions) {
        for (const effect of action.effects) {
          if (effect.kind === 'addItem') expect(itemIds.has(effect.key ?? '')).toBe(true);
        }
      }
    }
  });

  it('ids de acciones únicos en todo el mapa', () => {
    const ids = POIS.flatMap((p) => p.actions.map((a) => a.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
