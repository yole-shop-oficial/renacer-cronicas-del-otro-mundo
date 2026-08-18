/**
 * RECUERDOS COLECCIONABLES (§32, §39) — momentos importantes que
 * quedan grabados. Cada uno se activa con un flag del mundo y se
 * muestra en el Diario como una estampa narrada.
 */

export interface MemoryDef {
  id: string;
  flag: string;
  icon: import('@/ui/icons').IconName;
}

export const MEMORIES: MemoryDef[] = [
  { id: 'mem_rebirth', flag: 'accepted_rebirth', icon: 'soul' },
  { id: 'mem_first_meal', flag: '_entered_c1_03_honest', icon: 'village' },
  { id: 'mem_pip_believed', flag: 'pip_told_creature_scared', icon: 'bond' },
  { id: 'mem_first_combat', flag: 'won_first_combat', icon: 'sword' },
  { id: 'mem_freed_creature', flag: 'freed_mist_creature', icon: 'forest' },
  { id: 'mem_wraith', flag: 'defeated_wraith', icon: 'mystery' },
  { id: 'mem_saved_by_creature', flag: 'saved_by_creature', icon: 'heart' },
  { id: 'mem_lu_story', flag: '_entered_c2_lu_story', icon: 'coin' },
  { id: 'mem_letter_opened', flag: 'opened_bren_letter', icon: 'scroll' },
  { id: 'mem_vela_ally', flag: 'vela_ally', icon: 'shield' },
  { id: 'mem_cubs_freed', flag: 'coop_c2_freed_cubs', icon: 'heart' },
  { id: 'mem_vell_named', flag: 'knows_serpent_buyer', icon: 'lock' },
  { id: 'mem_fair_contract', flag: 'c3_took_contract', icon: 'scroll' },
  { id: 'mem_fair_cub', flag: 'c3_saved_cub', icon: 'heart' },
  { id: 'mem_defied_fate', flag: 'marca_del_destino', icon: 'star' },
  { id: 'mem_reunited', flag: 'grupo_reunido', icon: 'bond' }
];

export function earnedMemories(flags: Record<string, unknown>): MemoryDef[] {
  return MEMORIES.filter((m) => Boolean(flags[m.flag]));
}
