/**
 * RUMORES (§35) — verdaderos, falsos o parcialmente verdaderos.
 * Se desbloquean por flags de la historia y lugares visitados.
 * El jugador puede investigarlos; la verdad se revela con otros flags.
 */

export interface RumorDef {
  id: string;
  /** Dónde se oye. */
  sourceRegion: string;
  /** Flag que lo desbloquea (o null = disponible desde el inicio). */
  unlockFlag: string | null;
  /** Naturaleza real del rumor. */
  truth: 'true' | 'false' | 'partial';
  /** Flag que, si existe, revela al jugador la verdad del rumor. */
  revealFlag?: string;
}

export const RUMORS: RumorDef[] = [
  {
    id: 'rumor_mist_shadow',
    sourceRegion: 'aldea_brumal',
    unlockFlag: null,
    truth: 'partial',
    revealFlag: 'knows_creature_wounded'
  },
  {
    id: 'rumor_bren_medal',
    sourceRegion: 'aldea_brumal',
    unlockFlag: 'asked_about_bren',
    truth: 'true',
    revealFlag: 'knows_bren_story'
  },
  {
    id: 'rumor_well_wishes',
    sourceRegion: 'aldea_brumal',
    unlockFlag: 'walked_village',
    truth: 'false'
  },
  {
    id: 'rumor_serpent_guild',
    sourceRegion: 'ciudad_petra',
    unlockFlag: 'knows_serpent_warehouse',
    truth: 'true',
    revealFlag: 'heard_hunters_serpent'
  },
  {
    id: 'rumor_canal_ghost',
    sourceRegion: 'ciudad_petra',
    unlockFlag: 'walked_petra',
    truth: 'partial',
    revealFlag: 'knows_guard_corrupt'
  },
  {
    id: 'rumor_veloran_treasure',
    sourceRegion: 'ruinas_veloran',
    unlockFlag: 'servan_vell_arc_open',
    truth: 'partial',
    revealFlag: 'opened_sealed_chamber'
  },
  {
    id: 'rumor_vell_benefactor',
    sourceRegion: 'ciudad_petra',
    unlockFlag: 'servan_vell_arc_open',
    truth: 'false',
    revealFlag: 'knows_serpent_buyer'
  }
];

export function availableRumors(flags: Record<string, unknown>, discovered: string[]): RumorDef[] {
  return RUMORS.filter(
    (r) => discovered.includes(r.sourceRegion) && (!r.unlockFlag || Boolean(flags[r.unlockFlag]))
  );
}
