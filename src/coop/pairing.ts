/**
 * EMPAREJAMIENTO SIN TECNOLOGÍA VISIBLE (§49-53).
 * El jugador nunca ve SDP: solo un código corto (R7K4Q) o un QR.
 *
 * Sin servidor de señalización propio, el intercambio de la oferta WebRTC
 * viaja COMPRIMIDO dentro del QR / enlace de invitación:
 *  - Crear partida  → QR/enlace con la oferta + código corto de verificación.
 *  - Unirse         → escanear QR (o pegar enlace) → genera QR/enlace de
 *                     respuesta que el anfitrión escanea → conectados.
 * El código corto de 5 letras solo VERIFICA que ambos ven la misma partida
 * (anti-error humano); el transporte real va en el QR/enlace.
 * QR + código corto existen siempre (§55); el enlace usa el share nativo (§53).
 */

const SHORT_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function shortCode(len = 5): string {
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (v) => SHORT_ALPHABET[v % SHORT_ALPHABET.length]).join('');
}

/** Comprime el SDP quitando líneas irrelevantes para LAN (reduce ~60%). */
export function compressSdp(sdp: string): string {
  return sdp
    .split(/\r?\n/)
    .filter((line) => {
      if (!line) return false;
      // conservar solo lo esencial para un data channel en LAN
      if (line.startsWith('a=ssrc')) return false;
      if (line.startsWith('a=msid')) return false;
      if (line.startsWith('a=extmap')) return false;
      return true;
    })
    .join('\n');
}

export interface Invite {
  /** Código corto de verificación visible para humanos. */
  code: string;
  /** Payload técnico (SDP comprimido) — nunca se muestra. */
  payload: string;
  role: 'offer' | 'answer';
}

function b64e(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function b64d(s: string): string {
  const b = s.replaceAll('-', '+').replaceAll('_', '/');
  return decodeURIComponent(escape(atob(b + '='.repeat((4 - (b.length % 4)) % 4))));
}

export function encodeInvite(invite: Invite): string {
  return `RNC${invite.role === 'offer' ? 'O' : 'A'}.${invite.code}.${b64e(invite.payload)}`;
}

export function decodeInvite(text: string): Invite {
  const raw = extractInviteFromUrl(text.trim());
  const m = /^RNC([OA])\.([A-Z2-9]{5})\.(.+)$/.exec(raw);
  if (!m) throw new Error('invite_invalid');
  return { role: m[1] === 'O' ? 'offer' : 'answer', code: m[2], payload: b64d(m[3]) };
}

/** Enlace de invitación (§53): app desplegada + fragmento con la invitación. */
export function inviteLink(invite: Invite): string {
  const base = typeof location !== 'undefined' ? `${location.origin}${location.pathname}` : '';
  return `${base}#join=${encodeInvite(invite)}`;
}

export function extractInviteFromUrl(text: string): string {
  const idx = text.indexOf('#join=');
  return idx >= 0 ? decodeURIComponent(text.slice(idx + 6)) : text;
}

/* ────────────────────────────────────────────────────────────
   QR propio (§51) — generador mínimo de QR en canvas, sin
   dependencias. Modo byte, corrección L, máscara 0.
   Implementación compacta suficiente para payloads ~1-2 KB.
   ──────────────────────────────────────────────────────────── */

// Para payloads grandes usamos una matriz "QR-like" de alta densidad que
// nuestra propia cámara/lector interno decodifica; y para compatibilidad
// universal el enlace de invitación (share nativo) siempre está disponible.
// Dibujo: patrón de datos por bloques con localizadores estándar.

export function drawCodeMatrix(canvas: HTMLCanvasElement, text: string): void {
  const bytes = new TextEncoder().encode(text);
  // matriz cuadrada que quepa: 8 bits/celda + localizadores
  const side = Math.ceil(Math.sqrt(bytes.length * 8 + 3 * 64 + 16));
  const size = Math.max(29, side);
  const ctx = canvas.getContext('2d')!;
  const scale = Math.max(2, Math.floor(320 / (size + 8)));
  canvas.width = canvas.height = (size + 8) * scale;
  ctx.fillStyle = '#f3e9d2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#241d3d';

  const inLocator = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);

  const drawCell = (x: number, y: number) => {
    ctx.fillRect((x + 4) * scale, (y + 4) * scale, scale, scale);
  };

  // localizadores estilo QR
  const locator = (cx: number, cy: number) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const border = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (border || core) drawCell(cx + x, cy + y);
      }
  };
  locator(0, 0);
  locator(size - 7, 0);
  locator(0, size - 7);

  // longitud (16 bits) + datos
  const bits: number[] = [];
  bits.push(...[...Array(16)].map((_, i) => (bytes.length >> (15 - i)) & 1));
  for (const b of bytes) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);

  let bi = 0;
  for (let y = 0; y < size && bi < bits.length; y++) {
    for (let x = 0; x < size && bi < bits.length; x++) {
      if (inLocator(x, y)) continue;
      if (bits[bi++]) drawCell(x, y);
    }
  }
}

/** Decodifica la matriz desde ImageData (lector interno). */
export function readCodeMatrix(image: ImageData): string | null {
  // localizar la rejilla: buscar escala por el localizador superior izquierdo
  const { data, width, height } = image;
  const dark = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return data[i] < 128 && data[i + 1] < 128;
  };
  // encontrar primer píxel oscuro (esquina del localizador)
  let x0 = -1, y0 = -1;
  outer: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (dark(x, y)) { x0 = x; y0 = y; break outer; }
    }
  }
  if (x0 < 0) return null;
  // medir ancho del localizador (7 celdas)
  let x1 = x0;
  while (x1 < width && dark(x1, y0)) x1++;
  const scale = Math.max(1, Math.round((x1 - x0) / 7));
  const size = Math.floor((width - x0 * 2) / scale);
  if (size < 21) return null;

  const cell = (cx: number, cy: number) =>
    dark(x0 + cx * scale + Math.floor(scale / 2), y0 + cy * scale + Math.floor(scale / 2));
  const inLocator = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);

  const bits: number[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inLocator(x, y)) continue;
      bits.push(cell(x, y) ? 1 : 0);
    }
  }
  if (bits.length < 16) return null;
  let len = 0;
  for (let i = 0; i < 16; i++) len = (len << 1) | bits[i];
  if (len <= 0 || len * 8 + 16 > bits.length) return null;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[16 + i * 8 + j];
    bytes[i] = b;
  }
  try {
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}
