import { getMeta, setMeta } from './localdb';
import type { GameSave } from '@/domain/types';

/**
 * SISTEMA DE ALMAS SINCRONIZADAS — sin backend (solo GitHub + Vercel).
 *
 * Cada dispositivo alberga un ALMA (el personaje del jugador). Dos almas
 * pueden vincularse intercambiando su CÓDIGO DE ALMA: un paquete compacto
 * (base64) con el estado público del alma: nombre, clase, Diosa, nivel,
 * poder, región actual y títulos.
 *
 * Al introducir el código del compañero, su alma queda registrada en este
 * dispositivo: aparece su tarjeta (caramelo) con toda su información y su
 * posición en el mapa. Re-intercambiar códigos = re-sincronizar estado.
 * Funciona en iPhone, Android y Windows: solo necesita copiar/pegar texto
 * (mensajería, QR externo, o cualquier canal entre los dos teléfonos).
 */

export interface SoulProfile {
  soulId: string;
  name: string;
  gender: 'f' | 'm';
  templateId: string;
  classId: string;
  goddessId: string;
  level: number;
  power: number;
  regionId: string;
  titles: string[];
  /** Momento de emisión del código (para saber si está fresco). */
  issuedAt: number;
}

const SOUL_PREFIX = 'ALMA1.';

/** Construye el perfil público del alma local desde el guardado. */
export function buildSoulProfile(save: GameSave, power: number): SoulProfile {
  return {
    soulId: save.characterId,
    name: save.character.name,
    gender: save.character.gender ?? 'f',
    templateId: save.character.templateId,
    classId: save.character.classId,
    goddessId: save.character.goddessId,
    level: save.character.level,
    power,
    regionId: save.world.currentRegionId,
    titles: save.character.titles,
    issuedAt: Date.now()
  };
}

/** Serializa el alma a un código portable (base64 url-safe). */
export function encodeSoulCode(profile: SoulProfile): string {
  const json = JSON.stringify(profile);
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
  return SOUL_PREFIX + b64;
}

/** Decodifica y valida un código de alma. Lanza si es inválido. */
export function decodeSoulCode(code: string): SoulProfile {
  const trimmed = code.trim();
  if (!trimmed.startsWith(SOUL_PREFIX)) {
    throw new Error('invalid_prefix');
  }
  const b64 = trimmed
    .slice(SOUL_PREFIX.length)
    .replaceAll('-', '+')
    .replaceAll('_', '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const json = decodeURIComponent(escape(atob(padded)));
  const parsed = JSON.parse(json) as SoulProfile;
  if (
    typeof parsed.soulId !== 'string' ||
    typeof parsed.name !== 'string' ||
    typeof parsed.level !== 'number' ||
    typeof parsed.regionId !== 'string'
  ) {
    throw new Error('invalid_payload');
  }
  return parsed;
}

/** Persiste el alma del compañero en este dispositivo. */
export async function savePartnerSoul(profile: SoulProfile): Promise<void> {
  await setMeta('partner_soul', JSON.stringify(profile));
}

export async function loadPartnerSoul(): Promise<SoulProfile | null> {
  const raw = await getMeta('partner_soul');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SoulProfile;
  } catch {
    return null;
  }
}

export async function forgetPartnerSoul(): Promise<void> {
  await setMeta('partner_soul', '');
}

/** Información del dispositivo local (para Ajustes). */
export interface DeviceInfo {
  platform: 'iphone' | 'android' | 'windows' | 'mac' | 'other';
  label: string;
  standalone: boolean;
}

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (/iPhone|iPad|iPod/i.test(ua)) return { platform: 'iphone', label: 'iPhone / iPad', standalone };
  if (/Android/i.test(ua)) return { platform: 'android', label: 'Android', standalone };
  if (/Windows/i.test(ua)) return { platform: 'windows', label: 'Windows', standalone };
  if (/Macintosh/i.test(ua)) return { platform: 'mac', label: 'Mac', standalone };
  return { platform: 'other', label: 'Dispositivo', standalone };
}

/** Tipo de conexión (WiFi/celular) si el navegador lo expone. */
export function connectionType(): string {
  const nav = navigator as unknown as {
    connection?: { effectiveType?: string; type?: string };
  };
  const c = nav.connection;
  if (!c) return navigator.onLine ? 'online' : 'offline';
  return c.type ?? c.effectiveType ?? (navigator.onLine ? 'online' : 'offline');
}
