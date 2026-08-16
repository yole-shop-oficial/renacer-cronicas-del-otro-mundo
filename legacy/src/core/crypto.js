/**
 * 🔐 WEB CRYPTO API — AES-GCM LOCAL SAVE ENCRYPTION
 * ==================================================
 * Cifra y descifra los archivos de guardado local sensible utilizando algoritmos criptográficos modernos.
 * 
 * FASE 8: Cifrado Local
 */

// Deriva una clave criptográfica AES a partir de una contraseña e IV (sal de derivación)
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  
  // Convertir contraseña en un KeyMaterial básico
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derivar una clave simétrica AES-GCM de 256 bits
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Cifra un objeto de datos de la partida
 * @param {Object} data - Datos de la partida en formato JSON
 * @param {string} password - Contraseña del jugador / semilla de cifrado
 * @returns {Promise<string>} - String en formato Hex/Base64 que contiene IV, Sal y Datos cifrados
 */
export async function encryptData(data, password) {
  const enc = new TextEncoder();
  const plainText = enc.encode(JSON.stringify(data));
  
  // Generar un IV de 12 bytes aleatorios (Estándar recomendado para AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = 'renacer-unique-salt-2026'; // Sal fija para PBKDF2 (fácil de mantener)
  
  const key = await deriveKey(password, salt);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    plainText
  );
  
  // Empaquetar IV y buffer cifrado en formato Base64 para guardarlo como texto en IndexedDB
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  
  const packageObj = {
    iv: Array.from(iv),
    data: Array.from(encryptedBytes)
  };
  
  return btoa(JSON.stringify(packageObj));
}

/**
 * Descifra una cadena cifrada de la partida
 * @param {string} packageBase64 - El string en Base64 empaquetado
 * @param {string} password - Contraseña del jugador
 * @returns {Promise<Object>} - El objeto descifrado original
 */
export async function decryptData(packageBase64, password) {
  try {
    const dec = new TextDecoder();
    const packageObj = JSON.parse(atob(packageBase64));
    
    const iv = new Uint8Array(packageObj.iv);
    const encryptedBytes = new Uint8Array(packageObj.data);
    const salt = 'renacer-unique-salt-2026';
    
    const key = await deriveKey(password, salt);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedBytes
    );
    
    return JSON.parse(dec.decode(decryptedBuffer));
  } catch (err) {
    console.error('Falla al descifrar los datos de la partida local:', err);
    throw new Error('Contraseña incorrecta o archivo de guardado dañado.');
  }
}
