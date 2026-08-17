import Dexie, { type Table } from 'dexie';
import type { GameSave } from '@/domain/types';

/**
 * BASE DE DATOS LOCAL — Dexie sobre IndexedDB.
 * Transacciones, consultas indexadas, estable en Safari iOS.
 * Todo el estado del juego vive aquí: LOCAL SAVE primero, siempre.
 */
export interface SaveRow {
  gameId: string;
  /** Payload cifrado (AES-GCM) o plano según configuración. */
  payload: string;
  encrypted: boolean;
  updatedAt: number;
}

export interface MetaRow {
  key: string;
  value: string;
}

class RenacerDB extends Dexie {
  saves!: Table<SaveRow, string>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super('renacer-db');
    // v2 conserva IndexedDB de versiones anteriores (§95): la tabla
    // syncQueue queda huérfana pero Dexie la ignora sin destruir datos.
    this.version(1).stores({
      saves: 'gameId, updatedAt',
      syncQueue: 'id, status, createdAt',
      meta: 'key'
    });
    this.version(2).stores({
      saves: 'gameId, updatedAt',
      syncQueue: null,
      meta: 'key'
    });
  }
}

export const db = new RenacerDB();

export async function putSave(row: SaveRow): Promise<void> {
  await db.saves.put(row);
}

export async function getSave(gameId: string): Promise<SaveRow | undefined> {
  return db.saves.get(gameId);
}

export async function getLatestSave(): Promise<SaveRow | undefined> {
  return db.saves.orderBy('updatedAt').last();
}

export async function setMeta(key: string, value: string): Promise<void> {
  await db.meta.put({ key, value });
}

export async function getMeta(key: string): Promise<string | undefined> {
  return (await db.meta.get(key))?.value;
}

/** Serialización de guardado con versión de esquema para migraciones futuras. */
export function serializeSave(save: GameSave): string {
  return JSON.stringify(save);
}

export function deserializeSave(raw: string): GameSave {
  const parsed = JSON.parse(raw) as GameSave;
  if (typeof parsed.schemaVersion !== 'number') {
    throw new Error('Guardado corrupto: falta schemaVersion');
  }
  return parsed;
}
