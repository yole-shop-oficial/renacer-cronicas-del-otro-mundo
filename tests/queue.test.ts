import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/services/localdb';
import { enqueue, pendingOperations, markDone, markFailed, pendingCount } from '@/sync/queue';
import { createOperation, retryDelayMs, MAX_RETRIES } from '@/sync/operations';

describe('Cola offline (§30)', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
  });

  it('encola operaciones con UUID único e idempotente', async () => {
    const op1 = await enqueue('MAKE_DECISION', 'story_decision', 'd-1', { nodeId: 'n1' });
    const op2 = await enqueue('MAKE_DECISION', 'story_decision', 'd-2', { nodeId: 'n2' });
    expect(op1.id).not.toBe(op2.id);
    expect(op1.status).toBe('pending');
    expect(await pendingCount()).toBe(2);
  });

  it('devuelve operaciones pendientes en orden causal (createdAt)', async () => {
    const opA = createOperation('ADD_ITEM', 'item', 'i-1', {});
    opA.createdAt = 1000;
    const opB = createOperation('ADD_ITEM', 'item', 'i-2', {});
    opB.createdAt = 500;
    await db.syncQueue.bulkPut([opA, opB]);
    const pending = await pendingOperations();
    expect(pending[0].id).toBe(opB.id);
    expect(pending[1].id).toBe(opA.id);
  });

  it('markDone saca la operación de pendientes', async () => {
    const op = await enqueue('SAVE_SNAPSHOT', 'save', 'g-1', {});
    await markDone(op.id);
    expect(await pendingCount()).toBe(0);
  });

  it('markFailed incrementa retryCount y conserva el error', async () => {
    const op = await enqueue('SAVE_SNAPSHOT', 'save', 'g-2', {});
    await markFailed(op.id, 'network timeout');
    const stored = await db.syncQueue.get(op.id);
    expect(stored?.retryCount).toBe(1);
    expect(stored?.status).toBe('failed');
    expect(stored?.lastError).toBe('network timeout');
    // Sigue siendo reintentabe:
    expect(await pendingCount()).toBe(1);
  });

  it('descarta operaciones que superan MAX_RETRIES', async () => {
    const op = createOperation('SAVE_SNAPSHOT', 'save', 'g-3', {});
    op.retryCount = MAX_RETRIES;
    op.status = 'failed';
    await db.syncQueue.put(op);
    const pending = await pendingOperations();
    expect(pending).toHaveLength(0);
  });

  it('backoff exponencial con tope de 5 minutos', () => {
    expect(retryDelayMs(0)).toBe(1000);
    expect(retryDelayMs(3)).toBe(8000);
    expect(retryDelayMs(20)).toBe(5 * 60 * 1000);
  });
});
