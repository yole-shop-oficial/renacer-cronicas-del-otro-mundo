import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * CLIENTE SUPABASE (§32).
 * Credenciales SOLO desde variables de entorno (§5). Sin fallbacks
 * hardcodeados: si faltan, el juego funciona en modo local puro y
 * lo comunica con claridad (§88: no simular, degradar honestamente).
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey && !url.includes('TU-PROYECTO'));
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local'
    );
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // localStorage: compatible con Safari iOS y PWA standalone (§38).
        storage: window.localStorage
      }
    });
  }
  return client;
}

/** Comprobación de conectividad real (navigator.onLine miente a veces §75). */
export async function checkCloudReachable(timeoutMs = 5000): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey! },
      signal: controller.signal
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
