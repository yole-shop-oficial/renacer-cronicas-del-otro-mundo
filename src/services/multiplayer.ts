import { getSupabase } from './supabase';

/**
 * COOPERATIVO (§34-36).
 * Jugador 1 crea partida → GAME CODE de 6 caracteres.
 * Jugador 2 se une con el código → fila en game_players.
 * Realtime es un refuerzo, nunca una dependencia (§36).
 */

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin O/0/I/L/1 ambiguos

export function generateGameCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

export interface CoopGame {
  gameId: string;
  code: string;
  role: 'host' | 'guest';
}

export async function createCoopGame(userId: string, gameId: string): Promise<CoopGame> {
  const supabase = getSupabase();
  const code = generateGameCode();
  const { error } = await supabase.from('games').insert({
    id: gameId,
    host_user_id: userId,
    join_code: code
  });
  if (error) throw new Error(error.message);
  const { error: playerError } = await supabase
    .from('game_players')
    .insert({ game_id: gameId, user_id: userId, role: 'host' });
  if (playerError && playerError.code !== '23505') throw new Error(playerError.message);
  return { gameId, code, role: 'host' };
}

export async function joinCoopGame(userId: string, code: string): Promise<CoopGame> {
  const supabase = getSupabase();
  const normalized = code.trim().toUpperCase();
  const { data: game, error } = await supabase
    .from('games')
    .select('id, join_code')
    .eq('join_code', normalized)
    .single();
  if (error || !game) throw new Error('Código de partida no encontrado.');
  const { error: joinError } = await supabase
    .from('game_players')
    .insert({ game_id: game.id, user_id: userId, role: 'guest' });
  if (joinError && joinError.code !== '23505') throw new Error(joinError.message);
  return { gameId: game.id, code: normalized, role: 'guest' };
}

/**
 * Presencia realtime opcional (§36): saber si el compañero está conectado.
 * Si el canal falla, el juego continúa sin él.
 */
export function watchPartnerPresence(
  gameId: string,
  userId: string,
  onChange: (partnersOnline: number) => void
): () => void {
  try {
    const supabase = getSupabase();
    const channel = supabase.channel(`game:${gameId}`, {
      config: { presence: { key: userId } }
    });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const others = Object.keys(state).filter((k) => k !== userId).length;
        onChange(others);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void channel.track({ online_at: Date.now() });
      });
    return () => void getSupabase().removeChannel(channel);
  } catch {
    return () => undefined;
  }
}
