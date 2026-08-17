# ✦ RENACER: Crónicas del Otro Mundo ✦

> **«El mundo ya existe. La historia la escribes tú.»**

RPG narrativo de fantasía **Offline First**, instalable como app (PWA) en **iPhone, Android y Windows**, jugable en solitario o **entre dos almas conectadas en tiempo real por WiFi** — sin servidores, solo GitHub + Vercel.

Tu personaje no está siguiendo una historia. **Está viviendo una.**

---

## ⚔ NUEVO: Combate táctico en tiempo real

La lectura fluye al combate sin romper la historia: *"Algo se movió entre los árboles..."* → la interfaz cambia → **BESTIA DE NIEBLA** con barra de HP, telegrafiados con **ventana de reacción** (Esquivar/Bloquear/Interrumpir), hechizos con canalización (Meteoro, 4 s), elementos que interactúan (rayo+empapado = electrocución), estados (quemadura, congelación, silencio...), **jefes con fases** y **combos cooperativos** (Fuego+Viento = Tornado de fuego). Pausa suave para leer. La derrota crea historia, no Game Over.

## 🎮 El juego

- **Libro interactivo + RPG**: lees, decides, y el mundo **recuerda** cada decisión.
- **Prólogo + 3 capítulos** jugables (ES/EN): la Diosa, Aldea Brumal, el sello de la Sierpe y la Feria de Invierno.
- **8 personajes** (con género que adapta todos los textos), **8 clases**, **4 Diosas** con consecuencias reales.
- **Pantalla de carga (~6 s)** que precachea todo: después juegas **sin Internet**.

## ⚔ Sistemas

| Sistema | Qué hace |
|---|---|
| **Poder de combate** | Calculado automático: atributos efectivos + equipo + vínculos + nivel + habilidades. Con desglose transparente. |
| **Vínculos → poder** | Cada NPC potencia una estadística (Joren fuerza, Pip suerte, Vela inteligencia...). Nivel de vínculo 0-5. Las personas que te aprecian te hacen más fuerte. |
| **Misiones de NPC** | 11 misiones con requisitos de nivel/poder/vínculo desde la pestaña Vínculos. |
| **Progresión** | +10 puntos de atributo y +1 de habilidad por nivel. Los asignas tú. |
| **Árbol de habilidades** | 8 clases × 3 ramas × 3 niveles = 72 nodos con pasivas y habilidades activas. |
| **Inventario con slots** | Arma / Armadura / Accesorio, rarezas coloreadas, descripciones literarias, equipar/desequipar. |
| **Mapa con puntos de recorrido** | Cada región tiene lugares señalados con eventos, acciones y recompensas únicas. |
| **Árbol de la Vida** | Botón flotante → el libro de TU historia, página a página, solo hasta donde llegaste. |
| **Puertas de poder** | La historia puede exigir poder mínimo (condición `power` del motor). |

## 🎲 Dos almas en tiempo real (WiFi, sin servidor)

1. **Jugar con mi pareja** (§sin tecnología visible): Crear partida → código corto `R7K4Q` + **QR** + botón compartir. El otro escanea o abre el enlace → QR de respuesta → **Conectados ✓**. WebRTC directo en la misma WiFi, sin Internet.
2. El juego **detecta la conexión** y la historia cambia sola a modo dúo (`duoText`): la Diosa recibe a *dos* almas.
3. **Decisiones negociadas**: misma elección → acuerdo. Distinta → **discordia**: ceder o invocar los **Dados de los Dioses del Destino** (1d20 puro azar, animación dramática).
4. La decisión del **ganador** guía la historia de ambos. El perdedor puede **desafiar al destino**: paga un precio caro (mitad del oro, herida, −3 Suerte, la Marca del Destino) y el grupo se separa... hasta reencontrarse.
5. **Tarjeta caramelo** del alma vinculada: nombre, clase, Diosa, nivel, poder, posición en el mapa y títulos.

## 🏗️ Stack

Vite + React 18 + TypeScript (estricto) · Zustand · Dexie (IndexedDB) · Zod · Web Crypto (AES-GCM) · WebRTC · vite-plugin-pwa/Workbox · Vitest + Playwright · GitHub Actions.

**Sin backend**: SPA 100 % estática. El progreso vive cifrado en el dispositivo.

## 🚀 Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 105 tests unitarios
npm run test:e2e   # 4 flujos E2E (incluye offline + recarga)
npm run build      # typecheck + build + PWA
```

## ☁️ Despliegue en Vercel

1. Importa este repo en Vercel (framework: Vite; config en `vercel.json`).
2. No necesita variables de entorno.
3. Cada push a `main` despliega automáticamente (CI valida antes).

## 📁 Estructura

```
src/
  domain/     Tipos, stats, poder de combate y vínculos (puro)
  engine/     Motor narrativo: schema Zod, condiciones, efectos, texto {a|o}/{name}/{partner}
  content/    Prólogo + Capítulos 1-3 (data-driven, ES/EN, con duoText)
  data/       Clases, Diosas, personajes, objetos, NPC, árbol de habilidades, misiones, puntos de mapa
  coop/       Enlace WebRTC por WiFi + negociación de decisiones y dados
  services/   Dexie, cifrado, almas, red, dispositivo
  state/      Stores Zustand (juego, app, coop) + persistencia
  i18n/       Español + English
  ui/         Pantallas React + iconografía SVG propia (33 iconos, cero emojis)
tests/        Vitest (105) · e2e/ Playwright (4)
docs/         ARCHITECTURE.md · STORY_ENGINE.md
legacy/       Prototipo original (referencia)
```

## ✍️ Crear contenido

Los capítulos son datos validados con Zod: añadir historia no toca el motor. Guía completa en [`docs/STORY_ENGINE.md`](docs/STORY_ENGINE.md).

## 🔐 Seguridad

Sin secretos en el código. Guardado local cifrado (AES-GCM + PBKDF2). El enlace entre almas es directo entre dispositivos (WebRTC), sin pasar por ningún servidor.
