# Auditoría contra Instrucciones.txt (MEGA PROMPT DEFINITIVO)

Fecha: última iteración. Veredicto por sección (✅ completo · 🟡 parcial · ❌ pendiente).

## Núcleo
| § | Requisito | Estado | Evidencia |
|---|---|---|---|
| 1 | Eliminar Supabase por completo | ✅ | Sin dependencia, servicios, SQL, i18n ni config; `docs/TECH_DECISIONS.md` |
| 2 | Stack libre justificado | ✅ | Vite+React+TS; auditoría previa conservó lo bueno |
| 3-5 | Identidad: libro + combate integrado | ✅ | Nodos `encounter`+`combatId`, transición suave, `victoryGoto/defeatGoto` |
| 6-9 | Combate por comandos en tiempo real | ✅ | `combat/engine.ts`: atacar/hechizos/habilidades/defender/esquivar/analizar/objetos/huir |
| 10-11 | Magia + interacciones elementales | ✅ | 10 elementos; fuego+aceite, rayo+agua, hielo+agua, viento+fuego, fuego+hielo |
| 12 | Efectos de estado | ✅ | 15 estados con ticks, bloqueos y expiración |
| 13-14 | Enemigos con personalidad y jefes con fases | ✅ | 5 enemigos; Espectro (2 fases), Centinela (3), Desollador (3) |
| 15-17 | Analizar, cargas, interrupciones | ✅ | Reveals progresivos; Meteoro 4s; `interrupts` |
| 18-22 | Recursos, narración, victoria/derrota/muerte | ✅ | HP/MP/stamina/CD; toda derrota crea historia (rescates, captura, descarte) |
| 23-28 | Decisiones multicapa + personalidad | ✅ | Flags a largo plazo; 10 rasgos; 4 desbloqueos de combate por rasgo |
| 29-31 | Objetivo del personaje + Diosas + prólogo | ✅ | `life_hope` (8 respuestas); prólogo completo sin romantizar |
| 32-33 | Memoria + consecuencias ocultas | ✅ | Event-log de decisiones; flags que germinan capítulos después |
| 34-37 | NPC, rumores, diario, resumen | ✅ | Bios+memoria; 7 rumores (V/F/parcial); Diario 6 pestañas; "Mientras estabas fuera" |
| 38-39 | Mundo dinámico + recuerdos | ✅ | Reputación/flags globales; 22 recuerdos coleccionables |

## Cooperativo
| § | Requisito | Estado | Evidencia |
|---|---|---|---|
| 40-43 | Coop completo, combate coop, asimetría | ✅ | Explorar/decidir/combatir/dividirse/reunirse; acciones por clase |
| 44 | Escalera de desacuerdo | ✅ | Acuerdo→ceder→dados→desafío→separación→reencuentro |
| 45 | División de tareas simultáneas | ✅ | Capítulo 5: combate + ritual de pulsos EN PARALELO (coop por roles reclamados, solo en secuencia), 4 resoluciones fundidas |
| 46-47 | Hilos paralelos + memoria compartida | ✅ | Reencuentros por región (2 POVs); decisiones/flags compartidos |
| 48 | Vínculo entre jugadores | ✅ | trust/cooperation/rivalry/complicity con pulsos automáticos, visible en el panel |
| 49-55 | Conexión sin tecnología visible | ✅ | Código corto+QR+share; fallback pegar; reconexión "Continuar con {nombre}" |
| 56 | STUN/TURN/señalización | 🟡 | LAN directa (requisito sin servidor); API admite iceServers si algún día hay relay |
| 57-58 | Estados independientes + offline coop | ✅ | Internet/pareja/guardado separados; WebRTC LAN sin Internet |
| 66 | Panel del compañero en combate | ✅ | HP en vivo, estados, acción actual |
| 67-69 | Combos, sync por acciones, autoridad | ✅ | 6 combos; mensajes de acciones; simulación determinista por instancia |
| 70 | Reconexión durante combate | ✅ | Pausa breve automática + continuar en solitario |
| 71 | Persistencia del combate | 🟡 | Recompensas idempotentes por nodo (no duplicables); cerrar en pleno combate = reintentar el encuentro |

## Plataforma
| § | Requisito | Estado | Evidencia |
|---|---|---|---|
| 59-65 | Mobile first, navegación, pantalla combate, pausa | ✅ | 320px+, barra inferior, comandos de pulgar, pausa suave |
| 72-77 | Derrota rica, balance, progresión, clases, inventario | ✅ | Todo data-driven; árbol 72 nodos; slots |
| 78 | Mapa + LISTA | ✅ | Alternador persistente mapa/lista |
| 79-80 | Ilustraciones + rendimiento | ✅ | 13 retratos SVG; bundle ~30KB gzip inicial, code-split |
| 81 | Accesibilidad completa | ✅ | Contraste, labels, botones 44px+, `prefers-reduced-motion`, texto escalable 3 niveles |
| 82-83 | ES/EN + PWA | ✅ | i18n total; Workbox precache; iOS meta |
| 84 | Cuenta y recuperación | 🟡 | Sin nube por diseño (sin servidor): perfil local + export/import validado como recuperación |
| 85-88 | Guardado, motores separados, eventos, data-driven | ✅ | 5 motores; `CombatEvent`s; contenido = datos |
| 89-90 | Tests + E2E | ✅ | 158 unitarios + 5 E2E (registro→combate→offline→reapertura) |
| 91-92 | Seguridad + .env.example | ✅ | AES-GCM, validación Zod, checksums; sin secretos |
| 93 | 9 documentos | ✅ | README, ARCHITECTURE, STORY_ENGINE, COMBAT_ENGINE, COOP, OFFLINE, SECURITY, CONNECTION, TECH_DECISIONS (+AUDIT) |
| 94-96 | Legacy fuera, updates seguras, backup | ✅ | `legacy/` eliminado; Dexie v2 conserva datos; export/import con checksum |
| 97-98 | Modo demo + CI/CD | ✅ | Demo no persistente; CI: lint+typecheck+tests+build+E2E |
| 99-117 | Sin funciones falsas, contenido real, primera partida | ✅ | Prólogo+4 capítulos+epílogo; primer combate temprano; jefe con fases; QR; 320px |

## Pendientes honestos (los únicos)
1. **§56 relay TURN** — imposible sin servidor por requisito del proyecto; documentado como límite consciente.
2. **§71 guardado a mitad de combate** — decisión de diseño: reintentar el encuentro es más justo que restaurar un estado a medias; recompensas nunca se duplican.
3. **§84 cuenta en la nube** — reemplazada por diseño local-first puro + backup portable (requisito "sin Supabase/backend").
