# Decisiones técnicas

| Decisión | Alternativas | Por qué |
|---|---|---|
| Vite + React 18 + TS (SPA estática) | Next/Nuxt (SSR), SvelteKit | Offline-first puro sin servidor; PWA de primera clase; ecosistema/estabilidad |
| Sin Supabase ni backend | Supabase, Firebase | Requisito §1; coste cero; el juego es local + P2P |
| Dexie (IndexedDB) | RxDB, idb crudo | Transacciones, índices, estable en Safari iOS, ligero |
| WebRTC DataChannel LAN sin señalización | WebSocket + servidor, Supabase Realtime | Sin servidor disponible; misma WiFi = candidatos host |
| QR propio en canvas | librería qrcode | Cero dependencias; el lector interno decodifica la matriz; enlace share como vía universal |
| Motor de combate como reductor puro por ticks | game loop acoplado a React | Testeable (17 tests), determinista con RNG inyectable, sincronizable por acciones (§68-69) |
| Combos por ventana temporal de 4 s | bloqueo por turnos | Mantiene el tiempo real y tolera latencia LAN |
| Backup con checksum | export sin validar | §96 exige validar archivos |

## Auditoría §1 (eliminación de Supabase)
Eliminados: dependencia npm, `services/supabase|auth|multiplayer|coopDecisions`, `sync/` (cola cloud), `supabase/migrations`, `legacy/`, AuthScreen, claves i18n, runtimeCaching y manualChunks. La única mención restante vive en docs históricos de git.
