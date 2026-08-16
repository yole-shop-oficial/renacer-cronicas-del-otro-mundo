import type {
  CharacterState,
  DerivedBlock,
  NpcDef,
  PrimaryStat,
  RelationshipBlock,
  StatBlock,
  WorldState
} from './types';
import { deriveStats, mergeStats } from './stats';
import { itemById } from '@/data/items';

/**
 * SISTEMA DE PODER DE COMBATE Y VÍNCULOS.
 *
 * El poder se calcula automáticamente a partir de:
 *   stats efectivas (base + equipo + bonos de vínculo) + nivel + habilidades.
 *
 * VÍNCULOS: cada NPC potencia UNA estadística (bondStat). El nivel de
 * vínculo se calcula de los ejes positivos de la relación (trust,
 * friendship, respect, affection) menos el miedo. A más vínculo, más
 * bonificación — las personas que te aprecian te hacen más fuerte.
 */

/** Suma de ejes positivos - miedo, saturada a [0, 100]. */
export function bondScore(rel: RelationshipBlock): number {
  const positive = rel.trust + rel.friendship + rel.respect + rel.affection;
  return Math.max(0, Math.min(100, positive - Math.max(0, rel.fear)));
}

/** Nivel de vínculo 0-5 (cada 20 puntos = 1 nivel). */
export function bondLevel(rel: RelationshipBlock): number {
  return Math.min(5, Math.floor(bondScore(rel) / 20));
}

/** Bonificación de stat que otorga un NPC según su nivel de vínculo. */
export function bondBonus(rel: RelationshipBlock): number {
  return bondLevel(rel); // +1 por nivel de vínculo, máx +5 por NPC
}

/** Bonos de stats agregados de todos los vínculos del mundo. */
export function bondStatBonuses(
  npcs: NpcDef[],
  relationships: Record<string, RelationshipBlock>
): Partial<StatBlock> {
  const bonuses: Partial<StatBlock> = {};
  for (const npc of npcs) {
    const rel = relationships[npc.id];
    if (!rel) continue;
    const bonus = bondBonus(rel);
    if (bonus > 0) {
      bonuses[npc.bondStat] = (bonuses[npc.bondStat] ?? 0) + bonus;
    }
  }
  return bonuses;
}

/** Bonos de stats del equipo actualmente equipado. */
export function equipmentStatBonuses(character: CharacterState): Partial<StatBlock> {
  const bonuses: Partial<StatBlock> = {};
  for (const itemId of Object.values(character.equipment)) {
    if (!itemId) continue;
    try {
      const item = itemById(itemId);
      for (const [stat, value] of Object.entries(item.stats ?? {})) {
        const key = stat as PrimaryStat;
        bonuses[key] = (bonuses[key] ?? 0) + (value ?? 0);
      }
    } catch {
      /* objeto desconocido: ignorar */
    }
  }
  return bonuses;
}

/** Stats efectivas: base + equipo + vínculos. */
export function effectiveStats(
  character: CharacterState,
  npcs: NpcDef[],
  world: WorldState
): StatBlock {
  let stats = mergeStats(character.stats, equipmentStatBonuses(character));
  stats = mergeStats(stats, bondStatBonuses(npcs, world.npcRelationships));
  return stats;
}

/** Derivadas efectivas (HP/ataque/defensa... con equipo y vínculos). */
export function effectiveDerived(
  character: CharacterState,
  npcs: NpcDef[],
  world: WorldState
): DerivedBlock {
  return deriveStats(effectiveStats(character, npcs, world), character.level);
}

/**
 * PODER DE COMBATE — número único, calculado automáticamente.
 * Fórmula transparente y testeable:
 *   suma ponderada de derivadas efectivas + nivel*15 + habilidades*8.
 */
export function combatPower(
  character: CharacterState,
  npcs: NpcDef[],
  world: WorldState
): number {
  const d = effectiveDerived(character, npcs, world);
  const statPower =
    d.attack * 2 +
    d.defense * 2 +
    d.magicPower * 2 +
    d.speed +
    d.resistance +
    d.crit +
    Math.floor(d.hp / 10) +
    Math.floor(d.mp / 10);
  return statPower + character.level * 15 + character.skills.length * 8;
}

/** Desglose del poder para mostrar en la UI (transparencia total). */
export interface PowerBreakdown {
  total: number;
  fromStats: number;
  fromLevel: number;
  fromSkills: number;
  bondContribution: Partial<StatBlock>;
  equipContribution: Partial<StatBlock>;
}

export function powerBreakdown(
  character: CharacterState,
  npcs: NpcDef[],
  world: WorldState
): PowerBreakdown {
  const total = combatPower(character, npcs, world);
  const fromLevel = character.level * 15;
  const fromSkills = character.skills.length * 8;
  return {
    total,
    fromStats: total - fromLevel - fromSkills,
    fromLevel,
    fromSkills,
    bondContribution: bondStatBonuses(npcs, world.npcRelationships),
    equipContribution: equipmentStatBonuses(character)
  };
}

/** Puntos otorgados al subir de nivel. */
export const POINTS_PER_LEVEL = 10;
export const SKILL_POINTS_PER_LEVEL = 1;
