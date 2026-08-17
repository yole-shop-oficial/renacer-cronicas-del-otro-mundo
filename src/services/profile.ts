import { getMeta, setMeta } from './localdb';

/**
 * PERFIL LOCAL DEL ALMA — sin backend (§84 adaptado a offline-first puro):
 * la "cuenta" es el alma local del dispositivo. La recuperación entre
 * dispositivos se hace con exportar/importar partida (services/backup.ts).
 */

export interface LocalProfile {
  soulId: string;
  createdAt: number;
}

export async function ensureLocalProfile(): Promise<LocalProfile> {
  const raw = await getMeta('local_profile');
  if (raw) {
    try {
      return JSON.parse(raw) as LocalProfile;
    } catch {
      /* regenerar */
    }
  }
  const profile: LocalProfile = { soulId: crypto.randomUUID(), createdAt: Date.now() };
  await setMeta('local_profile', JSON.stringify(profile));
  // Secreto de cifrado local ligado al alma (usado por persistence.ts).
  await setMeta('session', JSON.stringify({ userId: profile.soulId, email: 'local@renacer' }));
  return profile;
}
