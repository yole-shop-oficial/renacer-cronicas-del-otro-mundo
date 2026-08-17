# Conexión entre parejas

## Lo que ve el jugador
Crear partida → `R7K4Q` + QR + Compartir · Unirse → escanear/abrir enlace → QR de respuesta → 🟢 Conectados. Estados: 🟢 conectado · 🟡 reconectando · 🔴 desconectado.

## Lo que ocurre por debajo
1. `RTCPeerConnection` sin iceServers (LAN pura: candidatos host bastan en la misma WiFi).
2. Oferta/respuesta SDP comprimidas (compressSdp) → base64url → QR propio (drawCodeMatrix) o enlace `#join=`.
3. DataChannel `renacer`: mensajes JSON tipados (`hello`, `pick`, `roll`, `combat_action`, `region`...) + ping cada 10 s.
4. Pérdida de conexión → estado `lost` → UI ofrece [Esperar (recrear)] [Continuar solo] (§114). El juego NUNCA se bloquea sin pareja.

## Por qué no hay STUN/TURN/señalización
Requisito del proyecto: solo GitHub + Vercel (estático). En LAN los candidatos host conectan directo; QR/enlace transportan la señalización. Si algún día se añade juego a distancia, `CoopLink` admite iceServers sin cambiar la API.
