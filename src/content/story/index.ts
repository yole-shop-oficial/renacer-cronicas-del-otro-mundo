import { validateChapter } from '@/engine/schema';
import { StoryEngine } from '@/engine/engine';
import { PROLOGUE } from './prologue';
import { CHAPTER_01 } from './chapter01';
import { CHAPTER_02 } from './chapter02';
import { CHAPTER_03 } from './chapter03';
import { CHAPTER_04 } from './chapter04';

/**
 * Registro de contenido narrativo.
 * Añadir un capítulo = importar + registrar. El motor no se toca (§10, §57).
 */
export function createStoryEngine(): StoryEngine {
  const engine = new StoryEngine();
  engine.registerChapter(validateChapter(PROLOGUE));
  engine.registerChapter(validateChapter(CHAPTER_01));
  engine.registerChapter(validateChapter(CHAPTER_02));
  engine.registerChapter(validateChapter(CHAPTER_03));
  engine.registerChapter(validateChapter(CHAPTER_04));
  return engine;
}

export const FIRST_NODE_ID = 'pro_01';
