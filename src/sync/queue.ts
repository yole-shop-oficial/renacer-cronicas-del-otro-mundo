import { db } from '@/services/localdb';
import {
  MAX_RETRIES,
  createOperation,
  retryDelayMs,
  type OperationType,
  type SyncOperation
} from './operations';

/**
 * COLA OFFLINE PERSISTENTE (§30).
 * LOCAL → CHANGE → QUEUE → SYNC → CLOUD (§24).
 * La cola vive en IndexedDB: sobrevive a cierres, reinicios y crashes.
 */

export async function enqueue(
  type: OperationType,
  entity: string,
  entityId: string,
  payload: Record<string, unknown>
): Promise<SyncOperation> {
  const op = createOperation(type, entity, entityId, payload);
  await db.syncQueue.put(op);
  return op;
}

export async function pendingOperations(): Promise<SyncOperation[]> {
  const ops = await db.syncQueue.where('status').anyOf('pending', 'failed').toArray();
  // Orden estricto por creación: las operaciones se aplican en orden causal.
  return ops
    .filter((op) => op.retryCount < MAX_RETRIES)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function markSyncing(id: string): Promise<void> {
  await db.syncQueue.update(id, { status: 'syncing' });
}

export async function markDone(id: string): Promise<void> {
  await db.syncQueue.update(id, { status: 'done' });
  // Limpieza: conservar solo las últimas 200 operaciones completadas.
  const done = await db.syncQueue.where('status').equals('done').sortBy('createdAt');
  if (done.length > 200) {
    const toDelete = done.slice(0, done.length - 200).map((op) => op.id);
    await db.syncQueue.bulkDelete(toDelete);
  }
}

export async function markFailed(id: string, error: string): Promise<void> {
  const op = await db.syncQueue.get(id);
  if (!op) return;
  await db.syncQueue.update(id, {
    status: 'failed',
    retryCount: op.retryCount + 1,
    lastError: error.slice(0, 500)
  });
}

export async function pendingCount(): Promise<number> {
  return db.syncQueue.where('status').anyOf('pending', 'failed').count();
}

/** ¿Cuánto esperar antes de reintentar una operación fallida? */
export function nextRetryDelay(op: SyncOperation): number {
  return retryDelayMs(op.retryCount);
}
