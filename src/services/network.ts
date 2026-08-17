/**
 * DETECCIÓN DE CONEXIÓN — Estados independientes (§57 de Instrucciones):
 * Internet (navigator.onLine) es independiente del enlace de pareja y
 * del guardado local. Sin backend: la única red que importa al juego
 * es la del navegador y el enlace directo entre almas.
 */

export type ConnectionState = 'ONLINE' | 'OFFLINE';

type Listener = (online: boolean) => void;

const listeners = new Set<Listener>();
let lastKnownOnline = navigator.onLine;

export function onConnectivityChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(online: boolean): void {
  if (online !== lastKnownOnline) {
    lastKnownOnline = online;
    listeners.forEach((l) => l(online));
  }
}

export function startConnectivityWatch(): () => void {
  const onOnline = () => emit(true);
  const onOffline = () => emit(false);
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  // Sondeo suave: iOS a veces no dispara eventos al despertar pestañas.
  const interval = setInterval(() => emit(navigator.onLine), 30_000);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    clearInterval(interval);
  };
}

export function isProbablyOnline(): boolean {
  return lastKnownOnline;
}
