/**
 * ☁️ SUPABASE CLOUD CONNECTOR & OFFLINE-FIRST SYNC ENGINE
 * =======================================================
 * Gestiona el canal de autenticación y de replicación/sincronización con la nube de Supabase.
 * 
 * FASE 5: Supabase & FASE 6: Offline First & FASE 7: Sincronización
 */

import { dbGet, dbPut, queueRemove, queueUpdate } from './db.js';

// Inicialización de Supabase con marcador de posición si es necesario
const supabaseUrl = window.NEXT_PUBLIC_SUPABASE_URL || 'https://lustmqeqbninkavixttz.supabase.co';
const supabaseKey = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'REEMPLAZADA_POR_SEGURIDAD_ver_env_example' /* CLAVE RETIRADA: usa variables de entorno (.env.example). Revoca la clave anterior en el dashboard de Supabase. */;

let supabaseClient = null;

// Inicializa el cliente si está disponible la librería importada
export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (typeof window !== 'undefined' && window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// Verifica la conexión a Internet y responde de forma asíncrona
export async function checkConnection() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  
  // Realizar un ping liviano a Supabase para verificar si hay conexión real o es falso/bloqueado
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: { 'apikey': supabaseKey }
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════
// AUTENTICACIÓN OFFLINE-FRIENDLY
// ═══════════════════════════════════════════════

export async function authSignUp(email, password) {
  const isConnected = await checkConnection();
  if (!isConnected) {
    throw new Error('Se requiere conexión a Internet para registrar una nueva cuenta.');
  }

  const client = getSupabase();
  if (!client) throw new Error('Cliente de Supabase no disponible.');

  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  
  // Guardar credenciales de sesión básicas en local para inicio de sesión Offline futuro
  await dbPut('save_data', 'session_user', { id: data.user.id, email: data.user.email });
  return data.user;
}

export async function authSignIn(email, password) {
  const isConnected = await checkConnection();
  
  if (!isConnected) {
    // Modo de inicio de sesión Offline: Verifica contra el usuario guardado localmente
    const cachedUser = await dbGet('save_data', 'session_user');
    if (cachedUser && cachedUser.email === email) {
      // Login Offline exitoso con credenciales cacheadas
      return { id: cachedUser.id, email: cachedUser.email, offline: true };
    }
    throw new Error('No tienes conexión a Internet y no hay credenciales locales guardadas para este correo.');
  }

  const client = getSupabase();
  if (!client) throw new Error('Cliente de Supabase no disponible.');

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  await dbPut('save_data', 'session_user', { id: data.user.id, email: data.user.email });
  return data.user;
}

// ═══════════════════════════════════════════════
// MOTOR DE SINCRONIZACIÓN IDEMPOTENTE (REST)
// ═══════════════════════════════════════════════

export async function syncOperationToCloud(op) {
  const client = getSupabase();
  if (!client) return false;

  const { type, entity, payload } = op;
  let response = null;

  try {
    if (type === 'CREATE_CHARACTER' || type === 'UPDATE_CHARACTER') {
      // Upsert para asegurar que la operación sea IDEMPOTENTE y no duplique registros
      response = await client.from('characters').upsert([payload]);
    } else if (type === 'ADD_ITEM') {
      response = await client.from('inventory').upsert([payload]);
    } else if (type === 'REMOVE_ITEM') {
      response = await client.from('inventory').delete().eq('id', payload.id);
    } else if (type === 'LEARN_SKILL') {
      response = await client.from('character_skills').upsert([payload]);
    } else if (type === 'COMPLETE_QUEST') {
      response = await client.from('quests').upsert([payload]);
    } else if (type === 'UPDATE_RELATIONSHIP') {
      response = await client.from('relationships').upsert([payload]);
    } else if (type === 'MAKE_DECISION') {
      response = await client.from('story_choices').upsert([payload]);
    } else if (type === 'UPDATE_WORLD') {
      response = await client.from('world_states').upsert([payload]);
    }

    if (response && response.error) {
      throw response.error;
    }
    
    return true;
  } catch (err) {
    console.error(`Sincronización falló para operación #${op.id}:`, err.message);
    return false;
  }
}

// Sincroniza recursivamente todos los elementos pendientes de la cola local
export async function syncLocalToCloud(pendingOps, onProgress) {
  let successCount = 0;

  for (const op of pendingOps) {
    if (onProgress) onProgress(`Sincronizando: ${op.type}...`);
    
    // Marcar en cola local como procesándose
    await queueUpdate(op.id, 'syncing', op.retries);

    const success = await syncOperationToCloud(op);

    if (success) {
      // Eliminar de la cola local al completarse exitosamente
      await queueRemove(op.id);
      successCount++;
    } else {
      // Incrementar intentos y marcar como fallido
      await queueUpdate(op.id, 'failed', op.retries + 1);
    }
  }

  return successCount;
}
