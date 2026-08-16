import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db, putSave, getLatestSave, serializeSave, deserializeSave, setMeta } from '@/services/localdb';
import { saveGameLocally, loadLatestGame } from '@/state/persistence';
import type { GameSave } from '@/domain/types';

function makeSave(gameId: string, updatedAt: number): GameSave {
  return {
    gameId,
    characterId: 'c-1',
    currentNodeId: 'pro_01',
    character: {
      id: 'c-1', templateId: 'liria', name: 'Test', gender: 'f', classId: 'mage', goddessId: 'aurelia',
      level: 1, xp: 0,
      stats: { strength: 3, intelligence: 10, agility: 5, vitality: 4, luck: 5, willpower: 6, charisma: 5 },
      currentHp: 90, currentMp: 80, skills: ['analyze'], inventory: [], gold: 0, titles: [], reputation: {}
    },
    world: {
      flags: {}, discoveredRegions: ['aldea_brumal'], currentRegionId: 'aldea_brumal',
      npcRelationships: {}, npcMemory: {}, quests: [], decisions: []
    },
    updatedAt,
    schemaVersion: 1
  };
}

describe('Persistencia local (§27, §43-44)', () => {
  beforeEach(async () => {
    await db.saves.clear();
    await db.meta.clear();
  });

  it('serializa y deserializa un guardado íntegro', () => {
    const save = makeSave('g-1', Date.now());
    const restored = deserializeSave(serializeSave(save));
    expect(restored).toEqual(save);
  });

  it('rechaza guardados corruptos sin schemaVersion', () => {
    expect(() => deserializeSave('{"foo":1}')).toThrow(/schemaVersion/);
  });

  it('getLatestSave devuelve el guardado más reciente', async () => {
    await putSave({ gameId: 'g-old', payload: serializeSave(makeSave('g-old', 100)), encrypted: false, updatedAt: 100 });
    await putSave({ gameId: 'g-new', payload: serializeSave(makeSave('g-new', 200)), encrypted: false, updatedAt: 200 });
    const latest = await getLatestSave();
    expect(latest?.gameId).toBe('g-new');
  });

  it('ciclo completo cifrado: guardar con sesión → recargar → estado intacto (§28, criterio 13)', async () => {
    await setMeta('session', JSON.stringify({ userId: 'user-123', email: 'a@b.c' }));
    const save = makeSave('g-enc', Date.now());
    await saveGameLocally(save);

    const stored = await getLatestSave();
    expect(stored?.encrypted).toBe(true);
    expect(stored?.payload).not.toContain('aldea_brumal'); // cifrado real

    const restored = await loadLatestGame();
    expect(restored).toEqual(save);
  });

  it('sin sesión guarda en claro pero recupera igual (modo local)', async () => {
    const save = makeSave('g-plain', Date.now());
    await saveGameLocally(save);
    const restored = await loadLatestGame();
    expect(restored).toEqual(save);
  });
});
