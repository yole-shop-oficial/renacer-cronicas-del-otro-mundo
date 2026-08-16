import { checkCloudReachable } from './supabase';

/**
 * DETECCIÓN DE CONEXIÓN (§26, §42, §75).
 * navigator.onLine es solo una pista: verificamos alcance real del backend.
 */

export type ConnectionState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNC_ERROR' | 'SYNC_SUCCESS';

type Listener = (online: boolean) => void;

const listeners = new Set<Listener>();
let lastKnownOnline = navigator.onLine;

export function onConnectivityChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function evaluate(): Promise<void> {
  const online = navigator.onLine ? await checkCloudReachable() : false;
  if (online !== lastKnownOnline) {
    lastKnownOnline = online;
    listeners.forEach((l) => l(online));
  }
}

export function startConnectivityWatch(): () => void {
  const onOnline = () => void evaluate();
  const onOffline = () => {
    // offline del navegador es fiable inmediatamente.
    if (lastKnownOnline) {
      lastKnownOnline = false;
      listeners.forEach((l) => l(false));
    }
  };
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  // Sondeo suave cada 30s: detecta recuperación aunque el evento no dispare (iOS §38).
  const interval = setInterval(() => void evaluate(), 30_000);
  void evaluate();
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    clearInterval(interval);
  };
}

export function isProbablyOnline(): boolean {
  return lastKnownOnline;
}
