import { validateChapter } from '@/engine/schema';
import { StoryEngine } from '@/engine/engine';
import { PROLOGUE } from './prologue';
import { CHAPTER_01 } from './chapter01';

/**
 * Registro de contenido narrativo.
 * Añadir un capítulo = importar + registrar. El motor no se toca (§10, §57).
 */
export function createStoryEngine(): StoryEngine {
  const engine = new StoryEngine();
  engine.registerChapter(validateChapter(PROLOGUE));
  engine.registerChapter(validateChapter(CHAPTER_01));
  return engine;
}

export const FIRST_NODE_ID = 'pro_01';
