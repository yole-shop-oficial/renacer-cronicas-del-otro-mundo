import type { GameSave } from '@/domain/types';
import { putSave, getLatestSave, serializeSave, deserializeSave, getMeta } from '@/services/localdb';
import { encryptText, decryptText } from '@/services/crypto';
import { enqueue } from '@/sync/queue';
import type { OperationType } from '@/sync/operations';

/**
 * PERSISTENCIA (§43-44).
 * LOCAL SAVE primero, siempre. La nube es una réplica, no la fuente.
 * El guardado local se cifra con AES-GCM usando el user id como secreto
 * (protección frente a lectura casual; la fuente de verdad protegida es
 * Supabase + RLS — ver docs/ARCHITECTURE.md).
 */

async function localSecret(): Promise<string | null> {
  const session = await getMeta('session');
  if (!session) return null;
  const { userId } = JSON.parse(session) as { userId: string };
  return `renacer:${userId}`;
}

export async function saveGameLocally(save: GameSave): Promise<void> {
  const secret = await localSecret();
  const raw = serializeSave(save);
  if (secret) {
    const payload = await encryptText(raw, secret);
    await putSave({ gameId: save.gameId, payload, encrypted: true, updatedAt: save.updatedAt });
  } else {
    await putSave({ gameId: save.gameId, payload: raw, encrypted: false, updatedAt: save.updatedAt });
  }
}

export async function loadLatestGame(): Promise<GameSave | null> {
  const row = await getLatestSave();
  if (!row) return null;
  try {
    if (row.encrypted) {
      const secret = await localSecret();
      if (!secret) return null;
      return deserializeSave(await decryptText(row.payload, secret));
    }
    return deserializeSave(row.payload);
  } catch (err) {
    // Guardado ilegible: no romper el arranque (§44). Se reporta y se
    // permite empezar de nuevo; la nube puede restaurar si existe.
    console.error('No se pudo restaurar el guardado local:', err);
    return null;
  }
}

export async function queueDecision(
  gameId: string,
  decisionId: string,
  nodeId: string,
  choiceId: string
): Promise<void> {
  // Cooperativo (§34-35): si hay partida compartida activa, la decisión se
  // registra bajo el gameId COMPARTIDO para que ambos jugadores la vean en
  // el mismo event log. Sin coop, se usa el gameId local.
  const coopGameId = await getMeta('coop_game_id');
  await enqueue('MAKE_DECISION', 'story_decision', decisionId, {
    gameId: coopGameId ?? gameId,
    nodeId,
    choiceId
  });
}

export async function queueSnapshot(save: GameSave, type: OperationType): Promise<void> {
  await enqueue(type, 'save', save.gameId, {
    gameId: save.gameId,
    snapshot: JSON.parse(serializeSave(save)) as Record<string, unknown>
  });
}
