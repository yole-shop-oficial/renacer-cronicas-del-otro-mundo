import { getSupabase, isSupabaseConfigured } from './supabase';
import { getMeta, setMeta } from './localdb';

/**
 * AUTENTICACIÓN (§25, §45).
 * - Primera conexión: requiere Internet (crear cuenta + sesión).
 * - Después: la sesión persiste localmente y el juego funciona offline
 *   sin cerrar sesión jamás por falta de red (§26).
 */

export interface SessionInfo {
  userId: string;
  email: string;
}

export async function signUp(email: string, password: string): Promise<SessionInfo> {
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Registro incompleto: revisa tu correo para confirmar.');
  const info = { userId: data.user.id, email: data.user.email ?? email };
  await cacheSession(info);
  return info;
}

export async function signIn(email: string, password: string): Promise<SessionInfo> {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const info = { userId: data.user.id, email: data.user.email ?? email };
  await cacheSession(info);
  return info;
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    await getSupabase().auth.signOut();
  }
}

/**
 * Recupera la sesión: primero de Supabase (si hay red/almacenada),
 * después de la caché local (modo offline §44).
 */
export async function restoreSession(): Promise<SessionInfo | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await getSupabase().auth.getSession();
      if (data.session?.user) {
        const info = {
          userId: data.session.user.id,
          email: data.session.user.email ?? ''
        };
        await cacheSession(info);
        return info;
      }
    } catch {
      // Sin red: caer a la caché local.
    }
  }
  const cached = await getMeta('session');
  return cached ? (JSON.parse(cached) as SessionInfo) : null;
}

async function cacheSession(info: SessionInfo): Promise<void> {
  await setMeta('session', JSON.stringify(info));
}

/** Modo local puro cuando Supabase no está configurado (documentado §88). */
export async function createLocalGuestSession(): Promise<SessionInfo> {
  const existing = await getMeta('guest_id');
  const userId = existing ?? crypto.randomUUID();
  if (!existing) await setMeta('guest_id', userId);
  const info = { userId, email: 'local@offline' };
  await cacheSession(info);
  return info;
}
