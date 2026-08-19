import type { GameSave } from '@/domain/types';
import type { NpcQuestDef, QuestObjective } from '@/data/npcQuests';
import { killCounterFlag } from '@/data/zones';
import { zoneById, exploredNodes } from '@/data/zones';

/**
 * PROGRESO DE MISIONES DE NPC — lógica pura sobre el GameSave.
 * El estado vive en world.flags:
 *   nqa_<id>        → etapa actual (número) — la misión está ACTIVA
 *   _nq_done_<id>   → entregada (terminada para siempre)
 * Los contadores se derivan del mundo real:
 *   kill    → flags kills_<enemyId> desde que se aceptó (snapshot)
 *   collect → inventario actual
 *   explore → nodos explorados de la zona
 *   visit   → regiones descubiertas
 */

export function activeStageIndex(save: GameSave, questId: string): number | null {
  const v = save.world.flags[`nqa_${questId}`];
  return typeof v === 'number' ? v : null;
}

export function isDelivered(save: GameSave, questId: string): boolean {
  return Boolean(save.world.flags[`_nq_done_${questId}`]);
}

/** Snapshot de kills al aceptar (para contar solo los nuevos). */
function killBaseFlag(questId: string, enemyId: string): string {
  return `nqkb_${questId}_${enemyId}`;
}

export function acceptQuestFlags(save: GameSave, quest: NpcQuestDef): Record<string, number> {
  const flags: Record<string, number> = { [`nqa_${quest.id}`]: 0 };
  for (const stage of quest.stages) {
    for (const obj of stage.objectives) {
      if (obj.kind === 'kill') {
        const current = Number(save.world.flags[killCounterFlag(obj.target)] ?? 0);
        flags[killBaseFlag(quest.id, obj.target)] = current;
      }
    }
  }
  return flags;
}

export function objectiveProgress(save: GameSave, quest: NpcQuestDef, obj: QuestObjective): number {
  switch (obj.kind) {
    case 'kill': {
      const base = Number(save.world.flags[killBaseFlag(quest.id, obj.target)] ?? 0);
      const now = Number(save.world.flags[killCounterFlag(obj.target)] ?? 0);
      return Math.min(obj.amount, Math.max(0, now - base));
    }
    case 'collect': {
      const entry = save.character.inventory.find((e) => e.itemId === obj.target);
      return Math.min(obj.amount, entry?.quantity ?? 0);
    }
    case 'explore': {
      try {
        const zone = zoneById(obj.target);
        // el nodo start no cuenta como progreso de misión
        return Math.min(obj.amount, exploredNodes(zone, save.world.flags).length - 1);
      } catch {
        return 0;
      }
    }
    case 'visit':
      return save.world.discoveredRegions.includes(obj.target) ? 1 : 0;
  }
}

export function stageComplete(save: GameSave, quest: NpcQuestDef, stageIdx: number): boolean {
  const stage = quest.stages[stageIdx];
  if (!stage) return false;
  return stage.objectives.every((o) => objectiveProgress(save, quest, o) >= o.amount);
}

/** ¿Lista para entregar? (última etapa completa) */
export function readyToDeliver(save: GameSave, quest: NpcQuestDef): boolean {
  const idx = activeStageIndex(save, quest.id);
  if (idx === null) return false;
  return idx === quest.stages.length - 1 && stageComplete(save, quest, idx);
}
