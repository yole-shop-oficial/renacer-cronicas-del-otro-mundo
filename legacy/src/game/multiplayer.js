/**
 * 👥 SHARED GAME SESSIONS & REALTIME COOP ENGINE
 * ===============================================
 * Define la estructura del multijugador cooperativo para compartir partidas narrativas mediante códigos de invitación.
 * 
 * FASE 15: Multijugador
 */

import { getSupabase } from '../core/supabase.js';
import { dbPut, dbGet } from '../core/db.js';

// Genera un código de 6 caracteres místico para la sesión compartida (ej: REN-8042)
function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REN-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Crea una sesión de juego cooperativo en Supabase
export async function createSharedGame(hostPlayerId, characterId) {
  const client = getSupabase();
  if (!client) {
    // Si no está conectado, retornar falso
    return null;
  }

  const code = generateGameCode();

  try {
    // 1. Insertar el juego en la tabla 'games'
    const { data: game, error: gameError } = await client
      .from('games')
      .insert([{
        code,
        host_id: hostPlayerId,
        status: 'waiting',
        current_node_id: 'intro-1'
      }])
      .select()
      .single();

    if (gameError) throw gameError;

    // 2. Insertar al anfitrión en 'game_players'
    const { error: playerError } = await client
      .from('game_players')
      .insert([{
        game_id: game.id,
        player_id: hostPlayerId,
        character_id: characterId,
        role: 'host'
      }]);

    if (playerError) throw playerError;

    // Guardar el id localmente de la partida compartida activa
    await dbPut('save_data', 'active_shared_game', { gameId: game.id, code });

    return { gameId: game.id, code };
  } catch (err) {
    console.error('Error creando partida compartida en Supabase:', err);
    return null;
  }
}

// Se une a una sesión existente mediante el código de invitación
export async function joinSharedGame(gameCode, guestPlayerId, characterId) {
  const client = getSupabase();
  if (!client) return null;

  try {
    // 1. Localizar la partida por el código
    const { data: game, error: fetchError } = await client
      .from('games')
      .select('*')
      .eq('code', gameCode)
      .eq('status', 'waiting')
      .single();

    if (fetchError || !game) throw new Error('Código de partida no válido o sesión ya iniciada.');

    // 2. Registrar al jugador invitado en 'game_players'
    const { error: joinError } = await client
      .from('game_players')
      .insert([{
        game_id: game.id,
        player_id: guestPlayerId,
        character_id: characterId,
        role: 'guest'
      }]);

    if (joinError) throw joinError;

    // 3. Cambiar estado del juego a 'playing'
    await client
      .from('games')
      .update({ status: 'playing' })
      .eq('id', game.id);

    // Guardar el id localmente de la partida compartida activa
    await dbPut('save_data', 'active_shared_game', { gameId: game.id, code: gameCode });

    return { gameId: game.id, code: gameCode, current_node_id: game.current_node_id };
  } catch (err) {
    console.error('Error uniéndose a partida compartida:', err.message);
    return null;
  }
}

// Actualiza el nodo de la historia compartido para sincronizar pantallas de ambos jugadores
export async function updateSharedGameNode(gameId, nodeId) {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('games')
      .update({ current_node_id: nodeId })
      .eq('id', gameId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando nodo compartido:', err);
    return false;
  }
}
