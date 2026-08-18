import type { Effect } from './schema';
import type { CharacterState, WorldState, RelationshipAxis, PrimaryStat, RelationshipBlock } from '@/domain/types';
import { applyXp, deriveStats } from '@/domain/stats';
import { addTrait, type TraitId } from '@/domain/personality';

export interface EffectResult {
  character: CharacterState;
  world: WorldState;
  /** Mensajes narrativos generados (inmersión §61). */
  log: { key: string; params?: Record<string, string | number> }[];
}

const EMPTY_REL: RelationshipBlock = {
  trust: 0,
  friendship: 0,
  respect: 0,
  fear: 0,
  affection: 0,
  rivalry: 0
};

/**
 * Aplicador de efectos del motor narrativo (§22).
 * Función pura: recibe estado, devuelve estado nuevo. La persistencia
 * y la cola de sync ocurren fuera (separación de capas §53).
 */
export function applyEffect(effect: Effect, character: CharacterState, world: WorldState): EffectResult {
  const c: CharacterState = structuredClone(character);
  const w: WorldState = structuredClone(world);
  const log: EffectResult['log'] = [];

  switch (effect.kind) {
    case 'gainXp': {
      const gained = effect.amount ?? 0;
      const prevLevel = c.level;
      const r = applyXp(c.level, c.xp, gained);
      c.level = r.level;
      c.xp = r.xp;
      log.push({ key: 'log.xpGained', params: { amount: gained } });
      if (r.leveledUp) {
        const levelsGained = c.level - prevLevel;
        // Sistema de progresión: +10 puntos de atributo y +1 de habilidad por nivel.
        c.unspentPoints = (c.unspentPoints ?? 0) + levelsGained * 10;
        c.skillPoints = (c.skillPoints ?? 0) + levelsGained * 1;
        const d = deriveStats(c.stats, c.level);
        c.currentHp = d.hp;
        c.currentMp = d.mp;
        log.push({ key: 'log.levelUp', params: { level: c.level } });
        log.push({ key: 'log.pointsGained', params: { points: levelsGained * 10, skillPoints: levelsGained } });
      }
      break;
    }
    case 'gainGold':
      c.gold = Math.max(0, c.gold + (effect.amount ?? 0));
      log.push({ key: 'log.goldGained', params: { amount: effect.amount ?? 0 } });
      break;
    case 'addItem': {
      const id = effect.key ?? '';
      const qty = effect.amount ?? 1;
      const entry = c.inventory.find((e) => e.itemId === id);
      if (entry) entry.quantity += qty;
      else c.inventory.push({ itemId: id, quantity: qty });
      log.push({ key: 'log.itemGained', params: { item: id, amount: qty } });
      break;
    }
    case 'removeItem': {
      const id = effect.key ?? '';
      const qty = effect.amount ?? 1;
      const entry = c.inventory.find((e) => e.itemId === id);
      if (entry) {
        entry.quantity = Math.max(0, entry.quantity - qty);
        c.inventory = c.inventory.filter((e) => e.quantity > 0);
      }
      break;
    }
    case 'learnSkill':
      if (!c.skills.includes(effect.key ?? '')) {
        c.skills.push(effect.key ?? '');
        log.push({ key: 'log.skillLearned', params: { skill: effect.key ?? '' } });
      }
      break;
    case 'setFlag':
      w.flags[effect.key ?? ''] = effect.value ?? true;
      break;
    case 'changeRelationship': {
      const npc = effect.target ?? '';
      const axis = (effect.axis ?? 'trust') as RelationshipAxis;
      const rel = w.npcRelationships[npc] ?? { ...EMPTY_REL };
      rel[axis] = Math.max(-100, Math.min(100, rel[axis] + (effect.amount ?? 0)));
      w.npcRelationships[npc] = rel;
      log.push({ key: 'log.relationshipChanged', params: { npc, axis, amount: effect.amount ?? 0 } });
      break;
    }
    case 'startQuest':
      if (!w.quests.some((q) => q.questId === effect.key)) {
        w.quests.push({ questId: effect.key ?? '', status: 'active', progress: {} });
        log.push({ key: 'log.questStarted', params: { quest: effect.key ?? '' } });
      }
      break;
    case 'completeQuest': {
      const q = w.quests.find((q) => q.questId === effect.key);
      if (q && q.status === 'active') {
        q.status = 'completed';
        log.push({ key: 'log.questCompleted', params: { quest: effect.key ?? '' } });
      }
      break;
    }
    case 'discoverRegion':
      if (!w.discoveredRegions.includes(effect.key ?? '')) {
        w.discoveredRegions.push(effect.key ?? '');
        log.push({ key: 'log.regionDiscovered', params: { region: effect.key ?? '' } });
      }
      break;
    case 'travelTo':
      w.currentRegionId = effect.key ?? w.currentRegionId;
      if (!w.discoveredRegions.includes(w.currentRegionId)) {
        w.discoveredRegions.push(w.currentRegionId);
      }
      break;
    case 'changeStat': {
      const stat = effect.key as PrimaryStat;
      if (stat in c.stats) {
        c.stats[stat] = Math.max(1, c.stats[stat] + (effect.amount ?? 0));
        log.push({ key: 'log.statChanged', params: { stat, amount: effect.amount ?? 0 } });
      }
      break;
    }
    case 'heal': {
      const d = deriveStats(c.stats, c.level);
      c.currentHp = Math.min(d.hp, c.currentHp + (effect.amount ?? 0));
      break;
    }
    case 'damage':
      c.currentHp = Math.max(0, c.currentHp - (effect.amount ?? 0));
      break;
    case 'addNpcMemory': {
      const npc = effect.target ?? '';
      const memories = w.npcMemory[npc] ?? [];
      if (!memories.includes(String(effect.value ?? ''))) {
        memories.push(String(effect.value ?? ''));
      }
      w.npcMemory[npc] = memories;
      break;
    }
    case 'grantTitle':
      if (!c.titles.includes(effect.key ?? '')) {
        c.titles.push(effect.key ?? '');
        log.push({ key: 'log.titleGranted', params: { title: effect.key ?? '' } });
      }
      break;
    case 'changeReputation': {
      const target = effect.key ?? 'global';
      c.reputation[target] = (c.reputation[target] ?? 0) + (effect.amount ?? 0);
      break;
    }
    case 'changeTrait': {
      // §27: las acciones moldean la personalidad.
      c.personality = addTrait(c.personality, effect.key as TraitId, effect.amount ?? 1);
      log.push({ key: 'log.traitChanged', params: { trait: effect.key ?? '', amount: effect.amount ?? 1 } });
      break;
    }
  }
  return { character: c, world: w, log };
}

export function applyEffects(effects: Effect[], character: CharacterState, world: WorldState): EffectResult {
  let c = character;
  let w = world;
  const log: EffectResult['log'] = [];
  for (const e of effects) {
    const r = applyEffect(e, c, w);
    c = r.character;
    w = r.world;
    log.push(...r.log);
  }
  return { character: c, world: w, log };
}
