# Combat Engine — Combate táctico en tiempo real

## Filosofía (§3-5 de Instrucciones)
El combate es narración que ocurre en tiempo real: texto + comandos, sin 3D ni joystick. La interfaz cambia suavemente desde la lectura (nodo `encounter` con `combatId`) y devuelve a la historia con `victoryGoto`/`defeatGoto`.

## Arquitectura
- `src/combat/types.ts` — contratos: acciones, enemigos, estados, eventos.
- `src/combat/engine.ts` — **reductor puro por ticks**: `tick(state, dt)`, `act`, `react`, `tryCoopCombo`. RNG inyectable → determinista y testeable.
- `src/combat/combos.ts` — combos cooperativos data-driven.
- `src/data/enemies.ts` — enemigos y jefes con fases.
- `src/data/combatActions.ts` — comandos por clase.
- `src/ui/screens/CombatScreen.tsx` — presentación móvil-first.

## Ritmo (§8)
Narración → telegrafiado enemigo → **ventana de reacción** (≥2 s, legible) → resolución narrada (`-42 HP` + "La bestia retrocede") → continúa. Pausa suave disponible (§65/§109): el tiempo se detiene para leer.

## Sistemas
- **Elementos** (§10-11): debilidad ×1.6, resistencia ×0.5, e interacciones que crean situaciones: fuego+aceite = explosión; rayo+empapado = aturdimiento; hielo+empapado = congelación; viento+quemadura = aviva llamas; fuego+congelado = descongela.
- **Estados** (§12): quemadura/veneno/sangrado (daño por tick), aturdido/congelado (bloquea), silencio (bloquea hechizos), barrera (reduce %), regen, prisa, miedo...
- **Carga e interrupción** (§16-17): Meteoro canaliza 4 s con narración; habilidades con `interrupts` cancelan telegrafiados.
- **Analizar** (§15): revela información progresiva (historia → debilidad → patrón).
- **Jefes** (§14): fases por umbral de HP que cambian movimientos, ritmo y texto.
- **Derrota ≠ Game Over** (§21): `defeatGoto` crea historia (rescate de Marta, deuda, la criatura te salva...).

## Cooperativo (§41-42, §66-68)
Se sincronizan **acciones**, no frames: `combat_action {actionId, element}` viaja por el DataChannel. Si el elemento del compañero llegó hace <4 s, `tryCoopCombo` puede disparar un combo (Tormenta de fuego, Campo congelante...). Cada jugador ejecuta su propia instancia; la autoridad de recompensas es local a cada guardado (idempotente por nodo, §71).
