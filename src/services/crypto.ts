/**
 * CIFRADO LOCAL (§28) — Web Crypto API, AES-GCM 256 + PBKDF2.
 * - No inventamos criptografía: solo primitivas estándar del navegador.
 * - No almacenamos contraseñas: la clave se deriva del alma local del
 *   dispositivo + salt aleatorio por escritura. Protege el guardado frente
 *   a lectura casual del dispositivo o de sus copias de seguridad.
 */

const PBKDF2_ITERATIONS = 150_000;

async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** Cifra un texto. Devuelve base64(salt | iv | ciphertext). */
export async function encryptText(plain: string, secret: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plain)
  );
  const out = new Uint8Array(salt.length + iv.length + cipher.byteLength);
  out.set(salt, 0);
  out.set(iv, salt.length);
  out.set(new Uint8Array(cipher), salt.length + iv.length);
  return toBase64(out);
}

/** Descifra un paquete generado por encryptText. */
export async function decryptText(packed: string, secret: string): Promise<string> {
  const bytes = fromBase64(packed);
  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const data = bytes.slice(28);
  const key = await deriveKey(secret, salt);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    data as BufferSource
  );
  return new TextDecoder().decode(plain);
}
