/**
 * COLA OFFLINE (§30) — Definición de operaciones.
 * Cada operación es idempotente: lleva un UUID que el servidor
 * usa para deduplicar (§31, criterio 17 del MVP).
 */

export const OPERATION_TYPES = [
  'CREATE_CHARACTER',
  'UPDATE_CHARACTER',
  'ADD_ITEM',
  'REMOVE_ITEM',
  'LEARN_SKILL',
  'COMPLETE_QUEST',
  'UPDATE_RELATIONSHIP',
  'MAKE_DECISION',
  'UPDATE_WORLD',
  'SAVE_SNAPSHOT'
] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export type SyncStatus = 'pending' | 'syncing' | 'done' | 'failed';

export interface SyncOperation {
  /** UUID v4 — clave de idempotencia extremo a extremo. */
  id: string;
  operationType: OperationType;
  entity: string;
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  status: SyncStatus;
  lastError?: string;
}

export function createOperation(
  operationType: OperationType,
  entity: string,
  entityId: string,
  payload: Record<string, unknown>
): SyncOperation {
  return {
    id: crypto.randomUUID(),
    operationType,
    entity,
    entityId,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
    status: 'pending'
  };
}

/** Backoff exponencial con tope: 2^n segundos, máx 5 min. */
export function retryDelayMs(retryCount: number): number {
  return Math.min(1000 * 2 ** retryCount, 5 * 60 * 1000);
}

export const MAX_RETRIES = 10;
