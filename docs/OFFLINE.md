# Offline First

- **Pantalla de carga (~6 s)**: espera real al service worker; precache completo del app shell (Workbox `autoUpdate`).
- **LOCAL SAVE primero, siempre** (§85): cada decisión persiste en IndexedDB (Dexie) cifrada con AES-GCM (clave derivada del alma local, PBKDF2 150k).
- **Actualizaciones seguras** (§95): versión 2 del esquema Dexie conserva IndexedDB anterior; `migrateSave()` completa campos nuevos sin perder progreso; `schemaVersion` en cada guardado.
- **Backup** (§96): exportar/importar partida como `RENACER1.<base64>` con checksum FNV-1a (services/backup.ts) — la vía de recuperación entre dispositivos sin nube.
- **Cooperativo offline** (§58): el enlace WebRTC es LAN-directo; funciona sin Internet.
