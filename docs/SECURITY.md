# Seguridad

- **Sin backend, sin secretos**: no hay tokens ni claves en el código (`.env.example` documenta que no se necesita ninguno).
- **Guardado local cifrado**: AES-GCM 256 + PBKDF2 (Web Crypto, sin criptografía casera). Protege frente a lectura casual del dispositivo/backup.
- **Enlace de pareja**: WebRTC con DTLS (cifrado extremo a extremo por diseño). El SDP intercambiado no contiene datos personales.
- **Validación**: todo el contenido narrativo se valida con Zod al arrancar; los backups se validan con checksum antes de importar; los códigos de invitación/alma se validan estructuralmente.
- **Idempotencia**: recompensas de combate/puntos/misiones deduplicadas por flags (`_combat_done_*`, `_poi_act_*`, `_nq_done_*`) — no se pueden duplicar recompensas (§71).
- **Límite honesto**: sin servidor autoritativo, la protección anti-trampa es local (cifrado + validación). Documentado en TECH_DECISIONS.md.
