import { create } from 'zustand';
import type { ConnectionState } from '@/services/network';
import { startConnectivityWatch, onConnectivityChange } from '@/services/network';
import { restoreSession, type SessionInfo } from '@/services/auth';
import { runSync } from '@/sync/syncer';
import { pendingCount } from '@/sync/queue';
import { isSupabaseConfigured } from '@/services/supabase';

/**
 * STORE DE APLICACIÓN — sesión, conexión y sincronización (§42).
 * Estados: ONLINE | OFFLINE | SYNCING | SYNC_ERROR | SYNC_SUCCESS.
 */

interface AppState {
  session: SessionInfo | null;
  connection: ConnectionState;
  pendingOps: number;
  cloudEnabled: boolean;
  banner: string | null;
  init: () => Promise<void>;
  setSession: (s: SessionInfo | null) => void;
  triggerSync: () => Promise<void>;
  refreshPending: () => Promise<void>;
  setBanner: (key: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  session: null,
  connection: navigator.onLine ? 'ONLINE' : 'OFFLINE',
  pendingOps: 0,
  cloudEnabled: isSupabaseConfigured(),
  banner: null,

  init: async () => {
    const session = await restoreSession();
    set({ session });
    await get().refreshPending();

    startConnectivityWatch();
    onConnectivityChange((online) => {
      if (online) {
        set({ connection: 'ONLINE', banner: 'status.connectionRestored' });
        // Conexión recuperada → sincronizar automáticamente (§29).
        void get().triggerSync();
      } else {
        set({ connection: 'OFFLINE', banner: null });
      }
    });

    // Al arrancar con red: sincronizar restos de la sesión anterior (§44).
    if (navigator.onLine && session && get().cloudEnabled) {
      void get().triggerSync();
    }
  },

  setSession: (session) => set({ session }),

  triggerSync: async () => {
    const { session, cloudEnabled } = get();
    if (!session || !cloudEnabled || session.email === 'local@offline') return;

    set({ connection: 'SYNCING', banner: 'status.syncing' });
    const report = await runSync(session.userId);
    await get().refreshPending();

    if (report.phase === 'success') {
      set({ connection: 'SYNC_SUCCESS', banner: 'status.syncSuccess' });
      setTimeout(() => {
        if (get().connection === 'SYNC_SUCCESS') set({ connection: 'ONLINE', banner: null });
      }, 3000);
    } else if (report.phase === 'error') {
      set({ connection: 'SYNC_ERROR', banner: 'status.syncError' });
      setTimeout(() => {
        if (get().connection === 'SYNC_ERROR')
          set({ connection: navigator.onLine ? 'ONLINE' : 'OFFLINE', banner: null });
      }, 4000);
    } else {
      set({ connection: navigator.onLine ? 'ONLINE' : 'OFFLINE' });
    }
  },

  refreshPending: async () => {
    set({ pendingOps: await pendingCount() });
  },

  setBanner: (banner) => set({ banner })
}));
