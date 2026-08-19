import { describe, it, expect } from 'vitest';
import {
  ZONES, zoneById, zoneForRegion, exploredNodes, reachableNodes,
  zoneCompletion, nodeExploredFlag, killCounterFlag
} from '@/data/zones';
import { NPC_QUESTS, npcQuestById } from '@/data/npcQuests';
import {
  activeStageIndex, acceptQuestFlags, objectiveProgress, stageComplete, readyToDeliver
} from '@/state/npcQuestState';
import { getEnemy } from '@/data/enemies';
import { ITEMS } from '@/data/items';
import { REGIONS } from '@/data/world';
import type { GameSave } from '@/domain/types';

function makeSave(flags: Record<string, boolean | number | string> = {}, inventory: { itemId: string; quantity: number }[] = []): GameSave {
  return {
    gameId: 'g', characterId: 'c', currentNodeId: 'c1_01',
    character: {
      id: 'c', templateId: 'liria', name: 'Alba', gender: 'f', classId: 'mage', goddessId: 'aurelia',
      level: 5, xp: 0, unspentPoints: 0, skillPoints: 0, treeNodes: [], equipment: {}, personality: {},
      stats: { strength: 8, intelligence: 12, agility: 8, vitality: 8, luck: 6, willpower: 9, charisma: 7 },
      currentHp: 100, currentMp: 60, skills: [], inventory, gold: 50, titles: [], reputation: {}
    },
    world: {
      flags, discoveredRegions: ['aldea_brumal', 'bosque_susurros'], currentRegionId: 'bosque_susurros',
      npcRelationships: {}, npcMemory: {}, quests: [], decisions: []
    },
    updatedAt: Date.now(), schemaVersion: 2
  };
}

describe('Zonas explorables', () => {
  it('las zonas están bien formadas: regiones y enemigos reales, grafo conexo', () => {
    const regionIds = new Set(REGIONS.map((r) => r.id));
    for (const zone of ZONES) {
      expect(regionIds.has(zone.regionId)).toBe(true);
      expect(zone.danger).toBeGreaterThanOrEqual(1);
      expect(zone.danger).toBeLessThanOrEqual(5);
      for (const e of zone.monsterPool) expect(() => getEnemy(e)).not.toThrow();
      const start = zone.nodes.filter((n) => n.kind === 'start');
      expect(start).toHaveLength(1);
      // conexiones simétricas y válidas
      const ids = new Set(zone.nodes.map((n) => n.id));
      for (const n of zone.nodes) {
        for (const c of n.connects) {
          expect(ids.has(c)).toBe(true);
          const other = zone.nodes.find((o) => o.id === c)!;
          expect(other.connects).toContain(n.id);
        }
      }
      // grafo conexo desde start (BFS)
      const visited = new Set([start[0].id]);
      const queue = [start[0].id];
      while (queue.length) {
        const curId = queue.shift()!;
        const cur = zone.nodes.find((n) => n.id === curId)!;
        for (const c of cur.connects) if (!visited.has(c)) { visited.add(c); queue.push(c); }
      }
      expect(visited.size).toBe(zone.nodes.length);
      // enemigos fijos válidos + objetos de gather válidos
      const itemIds = new Set(ITEMS.map((i) => i.id));
      for (const n of zone.nodes) {
        if (n.enemyId) expect(() => getEnemy(n.enemyId!)).not.toThrow();
        if (n.itemId) expect(itemIds.has(n.itemId)).toBe(true);
      }
    }
  });

  it('la progresión es por adyacencia: solo lo conectado a lo explorado', () => {
    const zone = zoneById('bosque_susurros');
    // al inicio: solo el start explorado, alcanzable lo que conecta con él
    let flags: Record<string, boolean> = {};
    expect(exploredNodes(zone, flags)).toEqual(['linde']);
    expect(reachableNodes(zone, flags)).toEqual(['senda']);
    // explorar senda abre claro_setas y arroyo
    flags[nodeExploredFlag(zone.id, 'senda')] = true;
    expect(reachableNodes(zone, flags).sort()).toEqual(['arroyo', 'claro_setas']);
    // el corazón sigue oculto (no adyacente)
    expect(reachableNodes(zone, flags)).not.toContain('corazon');
  });

  it('la completitud llega a 100% al explorar todo', () => {
    const zone = zoneById('bosque_susurros');
    const flags: Record<string, boolean> = {};
    for (const n of zone.nodes) flags[nodeExploredFlag(zone.id, n.id)] = true;
    expect(zoneCompletion(zone, flags)).toBe(100);
  });

  it('zoneForRegion mapea regiones con zona y sin ella', () => {
    expect(zoneForRegion('bosque_susurros')).not.toBeNull();
    expect(zoneForRegion('aldea_brumal')).toBeNull();
  });
});

describe('Misiones de NPC reales', () => {
  it('todas las misiones referencian objetivos válidos', () => {
    const itemIds = new Set(ITEMS.map((i) => i.id));
    for (const q of NPC_QUESTS) {
      expect(q.stages.length).toBeGreaterThan(0);
      if (q.kind === 'long') expect(q.stages.length).toBeGreaterThan(1);
      for (const stage of q.stages) {
        for (const obj of stage.objectives) {
          if (obj.kind === 'kill') expect(() => getEnemy(obj.target)).not.toThrow();
          if (obj.kind === 'collect') expect(itemIds.has(obj.target)).toBe(true);
          if (obj.kind === 'explore') expect(() => zoneById(obj.target)).not.toThrow();
          expect(obj.amount).toBeGreaterThan(0);
        }
      }
    }
  });

  it('ciclo corto: aceptar → progresar (kills desde snapshot) → entregar', () => {
    const q = npcQuestById('nq_bren_wolves');
    // ya llevaba 5 kills viejos: NO cuentan
    let save = makeSave({ [killCounterFlag('lobo_famelico')]: 5 });
    const accept = acceptQuestFlags(save, q);
    save = makeSave({ ...save.world.flags, ...accept });
    expect(activeStageIndex(save, q.id)).toBe(0);
    expect(objectiveProgress(save, q, q.stages[0].objectives[0])).toBe(0);
    // matar 3 más
    save.world.flags[killCounterFlag('lobo_famelico')] = 8;
    expect(objectiveProgress(save, q, q.stages[0].objectives[0])).toBe(3);
    expect(stageComplete(save, q, 0)).toBe(true);
    expect(readyToDeliver(save, q)).toBe(true);
  });

  it('collect usa el inventario real', () => {
    const q = npcQuestById('nq_marta_herbs');
    let save = makeSave(acceptQuestFlags(makeSave(), q), [{ itemId: 'healing_herb', quantity: 2 }]);
    expect(objectiveProgress(save, q, q.stages[0].objectives[0])).toBe(2);
    expect(readyToDeliver(save, q)).toBe(false);
    save = makeSave(save.world.flags, [{ itemId: 'healing_herb', quantity: 3 }]);
    expect(readyToDeliver(save, q)).toBe(true);
  });

  it('las largas exigen completar etapa a etapa', () => {
    const q = npcQuestById('nq_pip_bigquest');
    const zone = zoneById('bosque_susurros');
    let flags: Record<string, boolean | number> = { ...acceptQuestFlags(makeSave(), q) };
    // explorar 4 nodos (además del start)
    for (const n of ['senda', 'claro_setas', 'arroyo', 'espesura']) {
      flags[nodeExploredFlag(zone.id, n)] = true;
    }
    let save = makeSave(flags);
    expect(stageComplete(save, q, 0)).toBe(true);
    expect(readyToDeliver(save, q)).toBe(false); // aún queda la etapa 2
    // pasar a etapa 2 y cumplirla
    flags['nqa_' + q.id] = 1;
    flags['nqkb_' + q.id + '_lobo_famelico'] = 0;
    flags[killCounterFlag('lobo_famelico')] = 2;
    save = makeSave(flags, [{ itemId: 'colmillo_lobo', quantity: 1 }]);
    expect(stageComplete(save, q, 1)).toBe(true);
    expect(readyToDeliver(save, q)).toBe(true);
  });
});
