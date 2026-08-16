# Arquitectura — RENACER: Crónicas del Otro Mundo

## 1. Decisión de stack

### Requisitos que gobernaron la elección
Offline First real (§24), PWA instalable (§37), coste cero en MVP (§3), compatibilidad Supabase (§32), cooperativo (§34), y capacidad de crecer años (§90).

### Evaluación

| Opción | Veredicto | Razón |
|---|---|---|
| Next.js / Nuxt | ❌ | SSR aporta poco a un juego offline-first y complica el service worker y el despliegue. Un servidor no puede renderizar el estado que vive en IndexedDB del cliente. |
| SvelteKit / Solid / Qwik | ⚠️ | Excelente rendimiento, pero menor ecosistema y estabilidad a años vista; el mega prompt prioriza mantenimiento y comunidad. |
| Astro | ❌ | Orientado a sitios de contenido, no a aplicaciones con estado complejo. |
| **Vite + React 18 + TS (SPA)** | ✅ | Estático (gratis en Vercel), PWA de primera clase con Workbox, ecosistema máximo, tipado estricto, integración directa Supabase. |

Complementos: **Dexie** (vs IndexedDB puro: API transaccional; vs RxDB: más ligero, la reactividad la da Zustand), **Zod** (validación runtime del contenido narrativo), **Vitest**, **Workbox**.

## 2. Capas

```
UI (React)          → solo presenta y despacha acciones
state/ (Zustand)    → orquesta: motor → persistencia → cola
engine/ (puro)      → condiciones + efectos + navegación de nodos
domain/ (puro)      → stats, progresión, tipos
content/ (datos)    → capítulos Zod-validados
services/           → Dexie, WebCrypto, Supabase, red, auth, coop
sync/               → cola idempotente + syncer
```

Las capas `domain`, `engine` y `content` no importan nada de UI ni de red: son testeables y portables.

## 3. Flujo de datos (Offline First §24)

```
Decisión del jugador
  → engine.choose() (puro, deduplicado por decisionId UUID)
  → LOCAL SAVE (Dexie, AES-GCM)              ← fuente de verdad inmediata
  → enqueue(MAKE_DECISION) + enqueue(SAVE_SNAPSHOT)
  → [si hay red] runSync() → Supabase
```

El juego **nunca** espera a la red para continuar. La nube es una réplica.

## 4. Cola de sincronización (§30)

- Tabla `syncQueue` en IndexedDB: `{id(UUID), operationType, entity, entityId, payload, createdAt, retryCount, status, lastError}`.
- Procesamiento en **orden causal** (createdAt).
- **Idempotencia extremo a extremo**: el UUID del cliente es PK en `sync_operations` (Postgres). Conflicto 23505 = ya aplicada = éxito.
- Reintentos con backoff exponencial (1s → 5min, máx 10). Errores de auth detienen el ciclo sin quemar reintentos.

## 5. Resolución de conflictos (§31)

| Dato | Estrategia |
|---|---|
| Decisiones narrativas | **Event sourcing**: INSERT-only con UUID único. Nunca se pierden ni duplican. |
| XP / oro / inventario | Derivados del flujo de decisiones deduplicadas; el snapshot materializado viaja aparte. |
| Snapshot de guardado | **Last-write-wins por jugador** (`client_updated_at`): cada jugador solo escribe su propio save (clave `user_id, game_id`), no hay escritura concurrente entre dispositivos del mismo usuario salvo uso simultáneo, donde gana el más reciente. |
| Relaciones NPC | Acumulativas dentro del save; el clamp [-100,100] evita desbordes. |
| Estado del mundo coop | Cada jugador tiene su vista; los eventos compartidos se resuelven leyendo `story_decisions` de ambos (política de timeout/última decisión, base preparada §35). |
| `onEnter` de nodos | Flag `_entered_<nodeId>`: recargar la app no re-aplica recompensas. |

## 6. Cifrado local (§28)

- AES-GCM 256, clave derivada con PBKDF2 (150k iteraciones, SHA-256) desde `renacer:<userId>` + salt aleatorio por escritura.
- Amenaza cubierta: lectura casual del dispositivo/backup. **No** es protección contra el propio usuario (imposible en cliente): la integridad real la garantiza RLS + validación en servidor.
- No se almacenan contraseñas. Sin criptografía casera: solo Web Crypto API.

## 7. Autenticación (§25)

- Supabase Auth (email+password). Primera conexión requiere Internet.
- La sesión se cachea en `meta` (Dexie): al reabrir sin red, el jugador sigue dentro (criterio MVP 10-13). Jamás se cierra sesión por estar offline.
- Modo local honesto sin Supabase configurado (guest UUID persistente); documentado, no simulado (§88).

## 8. Base de datos (§33)

`profiles`, `games`, `game_players`, `saves` (snapshot jsonb), `story_decisions` (event log), `sync_operations` (dedupe), `content_catalog` (espejo de catálogos). Todas con **RLS**: un usuario solo accede a sus filas o a las de partidas donde es miembro. El trigger `on_auth_user_created` crea el perfil automáticamente.

## 9. Multijugador (§34-36)

- `games.join_code` único de 6 caracteres (alfabeto sin ambigüedades).
- `game_players` limita a 2 jugadores por política RLS.
- Presencia por Supabase Realtime **como refuerzo**: si el canal cae, el juego sigue.
- Decisiones cooperativas: ambas se registran en `story_decisions`; las políticas de timeout/última decisión se resuelven leyendo el event log (motor preparado, contenido futuro).

## 10. PWA / iOS (§37-38)

- `vite-plugin-pwa` con `autoUpdate`, precache del app shell completo, `NetworkOnly` para `*.supabase.co`.
- iOS: sesión en localStorage (no cookies), inputs con `font-size:16px` (evita zoom), `viewport-fit=cover` + safe-area, sondeo de conectividad cada 30 s porque los eventos online/offline son poco fiables al despertar pestañas suspendidas.

## 11. Seguridad (§45)

- Sin secretos en el repo; `.env.example` con placeholders.
- RLS en el 100% de las tablas; la anon key sola no da acceso a nada.
- Cabeceras de seguridad en `vercel.json` (nosniff, frame-deny, referrer).
- Validación Zod de todo el contenido al cargar; el servidor valida con constraints y RLS (nunca solo frontend).
- **Incidencia registrada**: el prototipo `legacy/` publicaba una anon key hardcodeada (proyecto `lustmqeqbninkavixttz`). Fue retirada; se recomienda **rotarla** en el dashboard.

## 12. Decisiones cooperativas duales (§35)

Implementación en `services/coopDecisions.ts` + `coopEventId` en el esquema de nodos:

- Cada jugador decide de forma **no bloqueante** (si el compañero se desconecta, el juego continúa: política de "modo individual").
- Ambas decisiones se escriben en `story_decisions` bajo el `game_id` **compartido** (INSERT-only, sin carreras destructivas).
- La UI muestra la elección del compañero: consulta puntual + Realtime opcional (`postgres_changes`). Sin red, simplemente no se muestra.
- Consecuencias combinadas: los capítulos futuros condicionan con `kind:'decision'` contra el event log — la "última decisión" y el "timeout" son políticas de lectura, no bloqueos de escritura.

## 13. Riesgos conocidos

1. Snapshot LWW entre dos dispositivos del mismo usuario jugando a la vez: ganaría el último; mitigable con merge por event log (previsto).
2. iOS puede purgar IndexedDB tras semanas sin uso: mitigado con sync temprano a la nube.
3. El contenido cooperativo con decisión dual necesita más capítulos que lo ejerciten (infraestructura lista).
