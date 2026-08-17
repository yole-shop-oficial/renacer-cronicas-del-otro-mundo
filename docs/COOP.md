# Cooperativo — Dos almas, un mundo

## Conexión (§49-56)
El jugador nunca ve WebRTC. Flujo "Jugar con mi pareja":
1. **Crear partida** → código corto (`R7K4Q`) + QR + botón compartir (share nativo).
2. **Unirse** → escanear QR / abrir enlace → QR de respuesta → el anfitrión lo escanea → **Conectados ✓**.
3. Fallback sin cámara: pegar la invitación (texto). QR + código siempre existen (§55).
4. **Reconexión** (§54): "Continuar con {nombre}" recuerda a la pareja.

Transporte: WebRTC DataChannel directo en la misma WiFi (sin STUN/TURN/señalización externa — no hay servidor). El SDP viaja comprimido dentro del QR/enlace; el código corto solo verifica visualmente la partida.

## Estados independientes (§57-58)
Internet, enlace de pareja y guardado local son independientes: se puede jugar Internet OFFLINE + pareja CONECTADA + guardado LOCAL OK.

## Decisiones (§44)
Escalera implementada: elegir → acuerdo | discordia → ceder | dados de los dioses (1d20) → el ganador guía | el perdedor puede desafiar (precio caro: mitad del oro, herida, −3 suerte, Marca del Destino) → separación → reencuentro narrativo por región (5 escenas, 2 puntos de vista).

## Combate cooperativo (§41-42, §67)
Acciones sincronizadas por mensajes; combos elementales al encadenar elementos en <4 s. Panel del compañero: nombre + última acción (§66).
