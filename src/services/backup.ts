import type { GameSave } from '@/domain/types';
import { deserializeSave, serializeSave } from './localdb';

/**
 * BACKUP DE PARTIDA (§96): exportar / importar / recuperar sin nube.
 * El archivo es un paquete validado con checksum: RENACER1.<base64url>.
 * Compatible con compartir por cualquier canal del teléfono.
 */

const PREFIX = 'RENACER1.';

function b64encode(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function b64decode(s: string): string {
  const b64 = s.replaceAll('-', '+').replaceAll('_', '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

/** Checksum simple (FNV-1a) para detectar corrupción del archivo. */
function checksum(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function exportSave(save: GameSave): string {
  const json = serializeSave(save);
  const pack = JSON.stringify({ v: 1, sum: checksum(json), data: json });
  return PREFIX + b64encode(pack);
}

export function importSave(code: string): GameSave {
  const raw = code.trim();
  if (!raw.startsWith(PREFIX)) throw new Error('backup_bad_prefix');
  const pack = JSON.parse(b64decode(raw.slice(PREFIX.length))) as {
    v: number;
    sum: string;
    data: string;
  };
  if (pack.v !== 1 || typeof pack.data !== 'string') throw new Error('backup_bad_format');
  if (checksum(pack.data) !== pack.sum) throw new Error('backup_corrupted');
  return deserializeSave(pack.data);
}

/** Descarga el backup como archivo .renacer (funciona en móvil y PC). */
export function downloadBackup(save: GameSave): void {
  const code = exportSave(save);
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `renacer-${save.character.name}-${new Date().toISOString().slice(0, 10)}.renacer`;
  a.click();
  URL.revokeObjectURL(url);
}
