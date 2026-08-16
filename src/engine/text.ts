/**
 * RENDERIZADO DE TEXTO NARRATIVO.
 * Los textos de la historia admiten dos marcadores:
 *   {name}        → nombre del personaje del jugador
 *   {sola|solo}   → forma femenina|masculina según el género del personaje
 * Ejemplo: «Voy sol{a|o}, Pip.» → «Voy sola, Pip.» (personaje femenino)
 */

export interface TextContext {
  name: string;
  gender: 'f' | 'm';
}

export function renderStoryText(raw: string, ctx: TextContext): string {
  return raw
    .replaceAll('{name}', ctx.name)
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_match, f: string, m: string) =>
      ctx.gender === 'f' ? f : m
    );
}
