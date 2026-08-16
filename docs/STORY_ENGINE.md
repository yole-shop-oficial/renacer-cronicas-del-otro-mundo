# Motor narrativo — Guía para escritores

El contenido de Renacer es **data-driven**: los capítulos son objetos TypeScript validados con Zod. Nunca necesitas tocar `src/engine/` para escribir historia.

## Conceptos

- **Capítulo** (`Chapter`): conjunto de nodos con un `startNodeId`.
- **Nodo** (`StoryNode`): una "página" — narración, diálogo o encuentro.
- **Elección** (`Choice`): botón que el jugador pulsa. Puede tener condiciones y efectos.
- **Condición** (`Condition`): decide si una elección está disponible.
- **Efecto** (`Effect`): muta el estado (XP, objetos, relaciones, flags, misiones...).

## Crear un capítulo nuevo

1. Crea `src/content/story/chapter02.ts`:

```ts
import type { Chapter } from '@/engine/schema';

export const CHAPTER_02: Chapter = {
  id: 'chapter_02',
  title: { es: 'Capítulo 2 — ...', en: 'Chapter 2 — ...' },
  startNodeId: 'c2_01',
  nodes: [
    {
      id: 'c2_01',
      chapterId: 'chapter_02',
      kind: 'narration',            // narration | dialogue | encounter
      text: { es: '...', en: '...' },
      onEnter: [],                   // efectos al entrar (una sola vez)
      choices: [
        {
          id: 'c2_01_a',
          text: { es: 'Hacer algo', en: 'Do something' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_02'              // o 'chapter:chapter_03'
        }
      ],
      end: false
    }
  ]
};
```

2. Regístralo en `src/content/story/index.ts`:

```ts
engine.registerChapter(validateChapter(CHAPTER_02));
```

3. Enlázalo desde el último nodo del capítulo anterior con `goto: 'chapter:chapter_02'`.

La validación detecta automáticamente saltos rotos y nodos duplicados al arrancar y en los tests.

## Condiciones disponibles

| kind | Ejemplo | Significado |
|---|---|---|
| `stat` | `{ kind:'stat', key:'intelligence', op:'>=', value:10 }` | Estadística mínima |
| `skill` | `{ kind:'skill', key:'analyze', op:'has' }` | Tiene la habilidad |
| `item` | `{ kind:'item', key:'old_locket', op:'has' }` | Lleva el objeto |
| `flag` | `{ kind:'flag', key:'freed_mist_creature', op:'has' }` | Flag del mundo activo |
| `relationship` | `{ kind:'relationship', target:'marta', axis:'trust', op:'>=', value:20 }` | Nivel de vínculo |
| `class` | `{ kind:'class', key:'mage', op:'has' }` | Clase del personaje |
| `goddess` | `{ kind:'goddess', key:'nyxara', op:'has' }` | Diosa elegida |
| `quest` | `{ kind:'quest', target:'quest_x', value:'completed' }` | Estado de misión |
| `decision` | `{ kind:'decision', key:'c1_05_talk', op:'has' }` | Decisión pasada (memoria del mundo §65) |

Usa `op:'not'` para negar cualquiera.

## Efectos disponibles

`gainXp`, `gainGold`, `addItem`, `removeItem`, `learnSkill`, `setFlag`,
`changeRelationship`, `startQuest`, `completeQuest`, `discoverRegion`,
`travelTo`, `changeStat`, `heal`, `damage`, `addNpcMemory`, `grantTitle`,
`changeReputation`.

Ejemplos:

```ts
{ kind: 'gainXp', amount: 25 }
{ kind: 'addItem', key: 'healing_herb', amount: 2 }
{ kind: 'changeRelationship', target: 'marta', axis: 'friendship', amount: 10 }
{ kind: 'setFlag', key: 'war_started', value: true }
{ kind: 'addNpcMemory', target: 'joren', value: 'player_helped_forge' }
```

## Reglas de oro

1. **IDs únicos globales** para nodos (prefijo por capítulo: `c2_...`).
2. **Textos siempre en `es` y `en`** (i18n §72). Nada de lorem ipsum.
3. Los **nombres visibles** de NPC/objetos/misiones van en `src/i18n/es.ts` y `en.ts` con claves `speaker.x`, `item.x`, `quest.x`.
4. `onEnter` se aplica **una sola vez** por partida (el motor lo deduplica).
5. Muestra opciones bloqueadas con `visibleWhenLocked: true` + `lockedHint` cuando quieras que el jugador sepa qué se está perdiendo (§16).
6. El mundo recuerda: usa `setFlag`/`addNpcMemory` generosamente y condiciónalos capítulos después (§65).
7. Añadir NPC/objetos/regiones nuevos: `src/data/*.ts` + traducciones + (opcional) espejo en `supabase/migrations`.

## Eventos cooperativos de decisión dual (§35)

Marca un nodo con `coopEventId` para convertirlo en decisión compartida:

```ts
{
  id: 'c2_06',
  coopEventId: 'c2_pier_choice',   // activa la UI cooperativa
  choices: [ /* una elección por camino */ ]
}
```

Comportamiento:
- En partida cooperativa, la UI muestra qué eligió el compañero (consulta al
  event log compartido + suscripción Realtime como refuerzo).
- **Nunca bloquea**: si el compañero está offline, el jugador decide y sigue
  (política "modo individual" del §35). La decisión de ambos queda registrada
  en `story_decisions` bajo el `game_id` compartido.
- Para consecuencias que dependan de AMBAS decisiones, condiciona nodos
  futuros con `{ kind: 'decision', key: '<choiceId>' }` leyendo la memoria
  del mundo.

## Editor futuro (§58)

Como el contenido es JSON-serializable y validado por Zod, un editor visual solo necesita producir objetos `Chapter` válidos — el esquema `ChapterSchema` es el contrato.
