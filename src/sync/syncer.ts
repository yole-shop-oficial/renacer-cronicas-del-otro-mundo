import { getSupabase, isSupabaseConfigured, checkCloudReachable } from '@/services/supabase';
import { markDone, markFailed, markSyncing, pendingOperations } from './queue';
import type { SyncOperation } from './operations';

/**
 * SINCRONIZADOR (§29, §31).
 * Procesa la cola en orden causal contra Supabase.
 * Idempotencia extremo a extremo: cada operación lleva UUID y el servidor
 * tiene una tabla sync_operations con UNIQUE(id) — reinsertar = no-op.
 */

export type SyncPhase = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncReport {
  phase: SyncPhase;
  processed: number;
  failed: number;
  remaining: number;
}

let syncing = false;

export async function runSync(userId: string): Promise<SyncReport> {
  if (!isSupabaseConfigured()) {
    return { phase: 'idle', processed: 0, failed: 0, remaining: 0 };
  }
  if (syncing) return { phase: 'syncing', processed: 0, failed: 0, remaining: 0 };
  syncing = true;

  let processed = 0;
  let failed = 0;

  try {
    const reachable = await checkCloudReachable();
    if (!reachable) {
      const remaining = (await pendingOperations()).length;
      return { phase: 'error', processed, failed, remaining };
    }

    const ops = await pendingOperations();
    for (const op of ops) {
      try {
        await markSyncing(op.id);
        await pushOperation(userId, op);
        await markDone(op.id);
        processed += 1;
      } catch (err) {
        failed += 1;
        await markFailed(op.id, err instanceof Error ? err.message : String(err));
        // Error de auth: detener todo, no quemar reintentos (§75).
        if (err instanceof Error && /jwt|auth|401/i.test(err.message)) break;
      }
    }
    const remaining = (await pendingOperations()).length;
    return { phase: failed > 0 ? 'error' : 'success', processed, failed, remaining };
  } finally {
    syncing = false;
  }
}

/**
 * Empuja una operación al servidor.
 * 1) Registra la operación en sync_operations (dedupe por UUID).
 * 2) Si es nueva, aplica el efecto en la tabla correspondiente.
 */
async function pushOperation(userId: string, op: SyncOperation): Promise<void> {
  const supabase = getSupabase();

  // Paso 1: insertar registro de operación. Conflicto de id = ya aplicada.
  const { error: opError } = await supabase.from('sync_operations').insert({
    id: op.id,
    user_id: userId,
    operation_type: op.operationType,
    entity: op.entity,
    entity_id: op.entityId,
    payload: op.payload,
    client_created_at: new Date(op.createdAt).toISOString()
  });

  if (opError) {
    // 23505 = unique_violation → operación ya sincronizada antes. Idempotente: OK.
    if (opError.code === '23505') return;
    throw new Error(`${opError.code ?? ''} ${opError.message}`);
  }

  // Paso 2: aplicar el efecto materializado.
  await applyOperation(userId, op);
}

async function applyOperation(userId: string, op: SyncOperation): Promise<void> {
  const supabase = getSupabase();
  switch (op.operationType) {
    case 'SAVE_SNAPSHOT': {
      // Snapshot completo del guardado: upsert por (user_id, game_id).
      const { error } = await supabase.from('saves').upsert(
        {
          user_id: userId,
          game_id: op.entityId,
          snapshot: op.payload,
          client_updated_at: new Date(op.createdAt).toISOString()
        },
        { onConflict: 'user_id,game_id' }
      );
      if (error) throw new Error(error.message);
      break;
    }
    case 'MAKE_DECISION': {
      // Event sourcing: INSERT con id único; duplicado = no-op (§31).
      const { error } = await supabase.from('story_decisions').insert({
        id: op.entityId,
        user_id: userId,
        game_id: String(op.payload.gameId ?? ''),
        node_id: String(op.payload.nodeId ?? ''),
        choice_id: String(op.payload.choiceId ?? ''),
        decided_at: new Date(op.createdAt).toISOString()
      });
      if (error && error.code !== '23505') throw new Error(error.message);
      break;
    }
    default:
      // Las demás operaciones quedan registradas en sync_operations como
      // event-log; el estado materializado viaja en SAVE_SNAPSHOT.
      // Estrategia documentada en docs/ARCHITECTURE.md (§31).
      break;
  }
}
