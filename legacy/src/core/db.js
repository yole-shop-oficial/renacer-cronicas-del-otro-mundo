/**
 * 💾 INDEXEDDB LOCAL-FIRST STORAGE & SYNC QUEUE
 * ============================================
 * Maneja el almacenamiento persistente local para que el juego funcione offline-first.
 * 
 * FASE 4: IndexedDB
 */

const DB_NAME = 'renacer_db';
const DB_VERSION = 1;

let dbInstance = null;

// Inicializa IndexedDB de forma asíncrona
export function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Almacenamiento general de la partida local
      if (!db.objectStoreNames.contains('save_data')) {
        db.createObjectStore('save_data');
      }
      
      // Cola de operaciones pendientes de sincronización con Supabase
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('Error abriendo IndexedDB:', e.target.error);
      reject(e.target.error);
    };
  });
}

// Obtener un registro del almacén
export async function dbGet(storeName, key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Guardar/Actualizar un registro
export async function dbPut(storeName, key, value) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value, key);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// Eliminar un registro
export async function dbDelete(storeName, key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// ═══════════════════════════════════════════════
// COLA DE SINCRONIZACIÓN (SYNC_QUEUE)
// ═══════════════════════════════════════════════

// Empuja una nueva operación a la cola
export async function queuePush(type, entity, payload) {
  const db = await initDB();
  const id = 'op-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  
  const op = {
    id,
    timestamp: Date.now(),
    type,       // 'CREATE_CHARACTER', 'ADD_ITEM', etc.
    entity,     // 'characters', 'inventory', etc.
    payload,
    status: 'pending', // 'pending', 'syncing', 'failed'
    retries: 0
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const request = store.put(op);

    request.onsuccess = () => {
      // Disparar evento para alertar al gestor de sincronización
      window.dispatchEvent(new CustomEvent('ludus-sync-added', { detail: op }));
      resolve(op);
    };
    request.onerror = () => reject(request.error);
  });
}

// Obtener todas las operaciones pendientes de sincronización (ordenadas por tiempo)
export async function queueGetPending() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const request = store.getAll();

    request.onsuccess = () => {
      const items = request.result || [];
      // Filtrar los pendientes u omitidos, ordenar por timestamp
      const filtered = items
        .filter(item => item.status === 'pending' || item.status === 'failed')
        .sort((a, b) => a.timestamp - b.timestamp);
      resolve(filtered);
    };
    request.onerror = () => reject(request.error);
  });
}

// Elimina una operación resuelta con éxito de la cola
export async function queueRemove(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// Actualiza los intentos o el estado de una operación de la cola
export async function queueUpdate(id, status, retries) {
  const db = await initDB();
  const op = await dbGet('sync_queue', id);
  if (!op) return false;

  op.status = status;
  op.retries = retries;

  return dbPut('sync_queue', id, op);
}
