import type { Chapter, Choice, StoryNode } from './schema';
import { evaluateAll } from './conditions';
import { applyEffects, type EffectResult } from './effects';
import type { CharacterState, WorldState } from '@/domain/types';

/**
 * MOTOR NARRATIVO (§22) — independiente de la interfaz.
 * Carga capítulos validados, resuelve nodos, filtra opciones por condiciones
 * y aplica consecuencias de forma pura y deduplicada.
 */
export class StoryEngine {
  private chapters = new Map<string, Chapter>();
  private nodeIndex = new Map<string, StoryNode>();

  registerChapter(chapter: Chapter): void {
    this.chapters.set(chapter.id, chapter);
    for (const node of chapter.nodes) {
      if (this.nodeIndex.has(node.id)) {
        throw new Error(`Nodo duplicado entre capítulos: ${node.id}`);
      }
      this.nodeIndex.set(node.id, node);
    }
  }

  getNode(nodeId: string): StoryNode {
    const node = this.nodeIndex.get(nodeId);
    if (!node) throw new Error(`Nodo narrativo inexistente: ${nodeId}`);
    return node;
  }

  getChapterStart(chapterId: string): string {
    const ch = this.chapters.get(chapterId);
    if (!ch) throw new Error(`Capítulo inexistente: ${chapterId}`);
    return ch.startNodeId;
  }

  /**
   * Opciones disponibles para el estado actual.
   * Devuelve visibles (disponibles) y bloqueadas-pero-mostradas (§16).
   */
  availableChoices(node: StoryNode, character: CharacterState, world: WorldState) {
    const available: Choice[] = [];
    const locked: Choice[] = [];
    for (const choice of node.choices) {
      if (evaluateAll(choice.conditions, character, world)) available.push(choice);
      else if (choice.visibleWhenLocked) locked.push(choice);
    }
    return { available, locked };
  }

  /**
   * Efectos de entrada a un nodo. Deduplicado por decisión registrada:
   * si el jugador ya entró a este nodo (visto en decisions), no re-aplica
   * (evita duplicar XP tras un reload — integridad §31, §81).
   */
  enterNode(node: StoryNode, character: CharacterState, world: WorldState): EffectResult {
    const alreadyEntered = world.flags[`_entered_${node.id}`] === true;
    if (alreadyEntered || node.onEnter.length === 0) {
      return { character, world, log: [] };
    }
    const result = applyEffects(node.onEnter, character, world);
    result.world.flags[`_entered_${node.id}`] = true;
    return result;
  }

  /**
   * Aplica una elección del jugador: registra la decisión con ID único
   * (event sourcing §31), aplica efectos y devuelve el siguiente nodo.
   */
  choose(
    node: StoryNode,
    choice: Choice,
    character: CharacterState,
    world: WorldState,
    decisionId: string
  ): EffectResult & { nextNodeId: string } {
    if (world.decisions.some((d) => d.id === decisionId)) {
      // Operación idempotente: la decisión ya fue aplicada.
      return { character, world, log: [], nextNodeId: this.resolveGoto(choice.goto) };
    }
    if (!evaluateAll(choice.conditions, character, world)) {
      throw new Error(`Elección no disponible: ${choice.id}`);
    }
    const result = applyEffects(choice.effects, character, world);
    result.world.decisions.push({
      id: decisionId,
      nodeId: node.id,
      choiceId: choice.id,
      at: Date.now()
    });
    return { ...result, nextNodeId: this.resolveGoto(choice.goto) };
  }

  private resolveGoto(goto: string): string {
    if (goto.startsWith('chapter:')) {
      return this.getChapterStart(goto.slice('chapter:'.length));
    }
    return goto;
  }
}
