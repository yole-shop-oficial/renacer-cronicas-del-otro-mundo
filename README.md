# ✦ RENACER: Crónicas del Otro Mundo ✦

> **«El mundo ya existe. La historia la escribes tú.»**

RPG narrativo de fantasía **persistente, Offline First, multiplataforma (PWA) y cooperativo**, construido para crecer durante años.

Tu personaje no está siguiendo una historia. **Está viviendo una.**

---

## 🎮 Qué es

Un libro mágico interactivo + RPG: lees, decides, y el mundo **recuerda**. Cada decisión modifica relaciones, reputación, misiones y el estado global del mundo. Dos jugadores pueden compartir la misma partida mediante un código.

- **8 personajes** únicos (stats, talentos y eventos propios)
- **8 clases** (Guerrero, Caballero, Mago, Arquero, Sacerdote, Pícaro, Invocador, Aventurero) — el motor admite clases avanzadas/ocultas
- **4 Diosas** con bendiciones y consecuencias narrativas reales
- **Motor narrativo data-driven**: capítulos como datos validados con Zod
- **Offline First real**: juega sin Internet; todo se sincroniza al volver
- **Cooperativo**: partida compartida por código de 6 caracteres

## 🏗️ Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| UI | React 18 + TypeScript | Madurez, comunidad, tipado estricto |
| Build/PWA | Vite + vite-plugin-pwa (Workbox) | SPA estática sin servidor, precache completo |
| Estado | Zustand | Ligero, sin boilerplate |
| BD local | Dexie (IndexedDB) | Transacciones, índices, estable en iOS |
| Cifrado local | Web Crypto (AES-GCM + PBKDF2) | Estándar del navegador, sin criptografía casera |
| Validación | Zod | Contenido narrativo y datos validados en runtime |
| Backend | Supabase (PostgreSQL + Auth + RLS + Realtime) | Serverless, gratuito en MVP |
| Tests | Vitest + fake-indexeddb | Rápido, nativo de Vite |
| CI/CD | GitHub Actions + Vercel | Typecheck, tests y build en cada push |

Decisiones detalladas en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 🚀 Instalación

```bash
git clone https://github.com/yole-shop-oficial/renacer-cronicas-otro-mundo.git
cd renacer-cronicas-otro-mundo
npm install
cp .env.example .env.local   # rellena tus claves de Supabase
npm run dev                  # http://localhost:5173
```

> **Sin Supabase configurado**, el juego arranca en **modo local**: todo el progreso se guarda cifrado en el dispositivo. Configura las variables para activar cuentas, nube y cooperativo.

## 🔑 Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima pública (la seguridad la impone RLS) |

⚠️ **Nunca** subas `.env`/`.env.local`, ni claves `service_role`, ni tokens de gestión. En Vercel usa *Environment Variables*; en GitHub Actions, *Secrets*.

## 🗄️ Base de datos (Supabase)

Migraciones versionadas en [`supabase/migrations/`](supabase/migrations):

1. `0001_schema.sql` — perfiles, partidas, jugadores, guardados, decisiones (event sourcing), cola de sincronización idempotente. **Todo con Row Level Security.**
2. `0002_seed.sql` — catálogos de contenido.

Aplicar: SQL Editor del dashboard (en orden) o `supabase db push` con la CLI.

## 📡 Offline y sincronización

```
LOCAL → CHANGE → QUEUE → SYNC → CLOUD
```

1. Cada decisión se guarda **primero** en IndexedDB (cifrada con AES-GCM).
2. Cada cambio genera una operación con **UUID idempotente** en la cola persistente.
3. Al recuperar conexión, la cola se procesa en orden causal contra Supabase.
4. Deduplicación en servidor: `UNIQUE(id)` — reenviar una operación es un no-op.
5. La UI muestra: `ONLINE / OFFLINE / SYNCING / SYNC_ERROR / SYNC_SUCCESS`.

Estrategia de conflictos por tipo de dato en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#resolución-de-conflictos).

## 📱 PWA

Instalable en Android, iOS y PC. El *service worker* precachea el app shell completo: el juego **arranca sin red**. Las llamadas a Supabase nunca se cachean (la capa de sync decide).

## 🤝 Cooperativo

1. Jugador 1: *Ajustes → Crear partida cooperativa* → recibe un código (p. ej. `K7MPQ2`).
2. Jugador 2: introduce el código → ambos quedan vinculados al mismo mundo.
3. Presencia en tiempo real vía Supabase Realtime (opcional: el juego nunca depende de ello).

## ✍️ Crear contenido narrativo

El contenido es **data-driven**: los escritores añaden capítulos sin tocar el motor. Guía completa en [`docs/STORY_ENGINE.md`](docs/STORY_ENGINE.md).

## 🧪 Testing

```bash
npm test           # 25 tests: motor, condiciones, idempotencia, cola, persistencia cifrada
npm run typecheck  # TypeScript estricto
npm run build      # typecheck + build + PWA
```

## ☁️ Despliegue (Vercel)

Proyecto SPA estático (`vercel.json` incluido). Conecta el repo en Vercel, define las dos variables de entorno y despliega. CI en GitHub Actions valida cada push.

## 🔒 Seguridad

- RLS en todas las tablas: cada usuario solo ve sus datos y los de su partida compartida.
- Cifrado local AES-GCM del guardado.
- Sin secretos en el código (ver `.env.example`).
- ⚠️ El código antiguo en `legacy/` contenía una anon key hardcodeada: fue retirada del código nuevo. **Rota esa clave** en el dashboard de Supabase (Settings → API → Reset).

## 🧭 Solución de problemas

| Problema | Solución |
|---|---|
| "Supabase no está configurado" | Crea `.env.local` desde `.env.example` |
| No sincroniza | Revisa el indicador de estado; la cola reintenta con backoff automático |
| Progreso "perdido" tras limpiar el navegador | El guardado local vive en IndexedDB; si tenías nube, vuelve a iniciar sesión |
| PWA no instala en iOS | Usa Safari → Compartir → Añadir a pantalla de inicio |

## 📁 Estructura

```
src/
  domain/     Tipos y reglas puras del juego (stats, progresión)
  engine/     Motor narrativo (schema Zod, condiciones, efectos)
  content/    Capítulos data-driven (prólogo, capítulo 1...)
  data/       Catálogos: clases, Diosas, personajes, objetos, mundo
  services/   Dexie, Web Crypto, Supabase, auth, red, multijugador
  sync/       Cola offline idempotente + sincronizador
  state/      Stores Zustand (app, juego, persistencia)
  i18n/       Español + English
  ui/         React: pantallas y tema visual
supabase/migrations/   SQL versionado (esquema + seed)
tests/                 Vitest
legacy/                Prototipo anterior (referencia histórica)
```
