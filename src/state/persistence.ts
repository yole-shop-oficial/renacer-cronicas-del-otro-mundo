import type { GameSave } from '@/domain/types';
import { putSave, getLatestSave, serializeSave, deserializeSave, getMeta } from '@/services/localdb';
import { encryptText, decryptText } from '@/services/crypto';
import { DEMO_GAME_ID } from '@/services/demo';

/**
 * PERSISTENCIA (§85): LOCAL SAVE, siempre y primero.
 * El guardado se cifra con AES-GCM ligado al alma local del dispositivo.
 * Recuperación entre dispositivos: exportar/importar (services/backup.ts).
 */

async function localSecret(): Promise<string | null> {
  const session = await getMeta('session');
  if (!session) return null;
  const { userId } = JSON.parse(session) as { userId: string };
  return `renacer:${userId}`;
}

export async function saveGameLocally(save: GameSave): Promise<void> {
  // MODO DEMO (§97): la partida de prueba jamás toca el disco.
  if (save.gameId === DEMO_GAME_ID) return;
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
    console.error('No se pudo restaurar el guardado local:', err);
    return null;
  }
}
