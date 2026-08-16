import { getSupabase, isSupabaseConfigured } from './supabase';
import { getMeta, setMeta } from './localdb';

/**
 * DECISIONES COOPERATIVAS (§35).
 * Política implementada (documentada en ARCHITECTURE.md):
 * - Sin bloqueo: cada jugador decide en su momento (modo individual siempre
 *   disponible). Si el compañero se desconecta, el juego continúa.
 * - Las decisiones de ambos quedan en story_decisions (event log compartido);
 *   la del compañero se consulta al llegar al evento y vía Realtime.
 * - "Última decisión" como registro: no hay carrera destructiva porque cada
 *   jugador escribe filas propias (INSERT-only).
 */

export interface PartnerDecision {
  choiceId: string;
  decidedAt: string;
}

/** Vincula la partida coop activa en el dispositivo. */
export async function setActiveCoopGame(gameId: string): Promise<void> {
  await setMeta('coop_game_id', gameId);
}

export async function getActiveCoopGame(): Promise<string | null> {
  return (await getMeta('coop_game_id')) ?? null;
}

/**
 * Consulta la decisión del compañero para un nodo cooperativo.
 * Devuelve null si aún no ha decidido, no hay coop o no hay red.
 */
export async function fetchPartnerDecision(
  userId: string,
  nodeId: string
): Promise<PartnerDecision | null> {
  if (!isSupabaseConfigured()) return null;
  const coopGameId = await getActiveCoopGame();
  if (!coopGameId) return null;
  try {
    const { data, error } = await getSupabase()
      .from('story_decisions')
      .select('choice_id, decided_at, user_id')
      .eq('game_id', coopGameId)
      .eq('node_id', nodeId)
      .neq('user_id', userId)
      .order('decided_at', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return { choiceId: data[0].choice_id as string, decidedAt: data[0].decided_at as string };
  } catch {
    return null; // Sin red: el coop nunca bloquea (§35, §36).
  }
}

/**
 * Suscripción Realtime a la decisión del compañero en un nodo (§36).
 * Refuerzo opcional: si el canal falla, fetchPartnerDecision sigue funcionando.
 */
export function watchPartnerDecision(
  userId: string,
  nodeId: string,
  onDecision: (d: PartnerDecision) => void
): () => void {
  if (!isSupabaseConfigured()) return () => undefined;
  try {
    const supabase = getSupabase();
    const channel = supabase
      .channel(`coop-decision:${nodeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'story_decisions', filter: `node_id=eq.${nodeId}` },
        (payload) => {
          const row = payload.new as { user_id: string; choice_id: string; decided_at: string };
          if (row.user_id !== userId) {
            onDecision({ choiceId: row.choice_id, decidedAt: row.decided_at });
          }
        }
      )
      .subscribe();
    return () => void supabase.removeChannel(channel);
  } catch {
    return () => undefined;
  }
}
