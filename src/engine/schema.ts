import { z } from 'zod';

/**
 * MOTOR NARRATIVO — Esquema de contenido (§22-23).
 * El contenido es 100% data-driven y se valida con Zod al cargar.
 * Los escritores crean nodos sin tocar el motor (ver docs/STORY_ENGINE.md).
 */

/** Condición declarativa evaluada contra el estado del juego. */
export const ConditionSchema = z.object({
  /** p.ej. 'stat' | 'skill' | 'item' | 'flag' | 'relationship' | 'class' | 'goddess' | 'quest' */
  kind: z.enum(['stat', 'skill', 'item', 'flag', 'relationship', 'class', 'goddess', 'quest', 'decision', 'power']),
  key: z.string(),
  op: z.enum(['>=', '<=', '==', '!=', 'has', 'not']).default('has'),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  /** Para relationship: eje concreto (trust, fear...). */
  axis: z.string().optional(),
  /** Para relationship/quest: id de NPC o quest. */
  target: z.string().optional()
});
export type Condition = z.infer<typeof ConditionSchema>;

/** Efecto declarativo que muta el estado del juego. */
export const EffectSchema = z.object({
  kind: z.enum([
    'gainXp',
    'gainGold',
    'addItem',
    'removeItem',
    'learnSkill',
    'setFlag',
    'changeRelationship',
    'startQuest',
    'completeQuest',
    'discoverRegion',
    'travelTo',
    'changeStat',
    'heal',
    'damage',
    'addNpcMemory',
    'grantTitle',
    'changeReputation',
    'changeTrait'
  ]),
  key: z.string().optional(),
  amount: z.number().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  target: z.string().optional(),
  axis: z.string().optional(),
  /** Texto narrativo inmersivo que acompaña al efecto (§61). */
  narration: z.record(z.string()).optional()
});
export type Effect = z.infer<typeof EffectSchema>;

export const ChoiceSchema = z.object({
  id: z.string(),
  /** Texto por idioma: { es: '...', en: '...' } (§72). */
  text: z.record(z.string()),
  /** Solo visible si TODAS las condiciones se cumplen. */
  conditions: z.array(ConditionSchema).default([]),
  /** Si visibleWhenLocked, se muestra bloqueada con su requisito (UX de habilidades §16). */
  visibleWhenLocked: z.boolean().default(false),
  lockedHint: z.record(z.string()).optional(),
  effects: z.array(EffectSchema).default([]),
  goto: z.string()
});
export type Choice = z.infer<typeof ChoiceSchema>;

export const StoryNodeSchema = z.object({
  id: z.string(),
  chapterId: z.string(),
  /** narration | dialogue | encounter (combate narrativo §17) */
  kind: z.enum(['narration', 'dialogue', 'encounter']).default('narration'),
  speaker: z.string().optional(),
  text: z.record(z.string()),
  /**
   * Texto alternativo cuando DOS ALMAS viajan juntas (modo dúo).
   * Si falta, se usa `text`. Marcadores {name} y {a|o} disponibles,
   * más {partner} para el nombre del alma compañera.
   */
  duoText: z.record(z.string()).optional(),
  /** Efectos aplicados al ENTRAR al nodo (una sola vez, deduplicado). */
  onEnter: z.array(EffectSchema).default([]),
  choices: z.array(ChoiceSchema).default([]),
  /**
   * Evento cooperativo (§35): si está definido, la decisión de cada jugador
   * se publica en el event log compartido y la UI muestra la del compañero.
   * Nunca bloquea: cada jugador puede decidir aunque el otro esté offline.
   */
  coopEventId: z.string().optional(),
  /**
   * COMBATE REAL (§4-5): si el nodo es 'encounter' y declara combatId,
   * la interfaz cambia suavemente al combate táctico. victoryGoto y
   * defeatGoto continúan la historia según el resultado (§20-21:
   * la derrota crea historia, no Game Over).
   */
  combatId: z.string().optional(),
  victoryGoto: z.string().optional(),
  defeatGoto: z.string().optional(),
  /** TAREAS DIVIDIDAS (§45): dos tareas simultáneas cuyos resultados se funden. */
  splitTaskId: z.string().optional(),
  /** Nodo terminal de capítulo. */
  end: z.boolean().default(false)
});
export type StoryNode = z.infer<typeof StoryNodeSchema>;

export const ChapterSchema = z.object({
  id: z.string(),
  title: z.record(z.string()),
  startNodeId: z.string(),
  nodes: z.array(StoryNodeSchema)
});
export type Chapter = z.infer<typeof ChapterSchema>;

/** Valida un capítulo completo y la integridad de sus saltos internos. */
export function validateChapter(raw: unknown): Chapter {
  const chapter = ChapterSchema.parse(raw);
  const ids = new Set(chapter.nodes.map((n) => n.id));
  for (const node of chapter.nodes) {
    for (const choice of node.choices) {
      if (!ids.has(choice.goto) && !choice.goto.startsWith('chapter:')) {
        throw new Error(
          `Capítulo ${chapter.id}: la opción ${choice.id} del nodo ${node.id} salta a un nodo inexistente: ${choice.goto}`
        );
      }
    }
  }
  if (!ids.has(chapter.startNodeId)) {
    throw new Error(`Capítulo ${chapter.id}: startNodeId inexistente`);
  }
  return chapter;
}
