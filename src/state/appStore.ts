import { create } from 'zustand';
import { startConnectivityWatch, onConnectivityChange } from '@/services/network';
import { ensureLocalProfile, type LocalProfile } from '@/services/profile';

/**
 * STORE DE APLICACIÓN — Estados INDEPENDIENTES (§57):
 *  - Internet:  ONLINE | OFFLINE     (solo informativo: el juego es local)
 *  - Guardado:  local, siempre       (LOCAL SAVE primero, §85)
 *  - Pareja:    la gestiona coopStore (conectada/reconectando/desconectada)
 */

interface AppState {
  profile: LocalProfile | null;
  online: boolean;
  banner: string | null;
  init: () => Promise<void>;
  setBanner: (key: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  online: navigator.onLine,
  banner: null,

  init: async () => {
    const profile = await ensureLocalProfile();
    set({ profile });
    startConnectivityWatch();
    onConnectivityChange((online) => {
      set({ online, banner: online ? 'status.connectionRestored' : null });
      if (online) {
        setTimeout(() => {
          if (get().online) set({ banner: null });
        }, 3000);
      }
    });
  },

  setBanner: (banner) => set({ banner })
}));
