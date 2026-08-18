/**
 * ENLACE ENTRE DOS ALMAS EN TIEMPO REAL — WebRTC DataChannel.
 *
 * Sin servidor (solo GitHub + Vercel): los dos teléfonos en la MISMA WiFi
 * se conectan DIRECTAMENTE entre sí. El emparejamiento inicial requiere
 * intercambiar dos códigos (ancla → respuesta); una vez anclados, todo
 * es tiempo real: elecciones, dados, presencia, posición en el mapa.
 *
 * Host  : createAnchor() → CÓDIGO ANCLA  → (se lo pasa al invitado)
 * Guest : acceptAnchor(ancla) → CÓDIGO RESPUESTA → (se lo pasa al host)
 * Host  : completeLink(respuesta) → ¡conectados en tiempo real!
 *
 * En la misma red WiFi los candidatos ICE locales bastan: no hace falta
 * STUN ni Internet. Compatible con iPhone, Android y Windows.
 */

export type CoopMessage =
  | { t: 'hello'; soul: { name: string; level: number; power: number; regionId: string; classId: string; templateId: string; goddessId: string; gender: 'f' | 'm' } }
  | { t: 'pick'; nodeId: string; choiceId: string }
  | { t: 'yield'; nodeId: string }
  | { t: 'dice_invoke'; nodeId: string }
  | { t: 'roll'; nodeId: string; value: number }
  | { t: 'defy'; nodeId: string }
  | { t: 'node'; nodeId: string }
  | { t: 'region'; regionId: string }
  | { t: 'combat_action'; actionId: string; element: string }
  | { t: 'combat_vitals'; hp: number; maxHp: number; status: string[] }
  | { t: 'bond_pulse'; kind: 'agreement' | 'discord' | 'yield' | 'combo' | 'reunion' }
  | { t: 'leave_group' }
  | { t: 'reunite' }
  | { t: 'ping' };

type MessageHandler = (msg: CoopMessage) => void;
type StateHandler = (state: LinkState) => void;

export type LinkState = 'idle' | 'anchoring' | 'connecting' | 'connected' | 'lost';

const CODE_PREFIX = { offer: 'ANCLA1.', answer: 'UNION1.' } as const;

function encodePayload(prefix: string, obj: unknown): string {
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
  return prefix + b64;
}

function decodePayload<T>(prefix: string, code: string): T {
  const raw = code.trim();
  if (!raw.startsWith(prefix)) throw new Error('bad_prefix');
  const b64 = raw.slice(prefix.length).replaceAll('-', '+').replaceAll('_', '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return JSON.parse(decodeURIComponent(escape(atob(padded)))) as T;
}

export class CoopLink {
  private pc: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private handlers = new Set<MessageHandler>();
  private stateHandlers = new Set<StateHandler>();
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  state: LinkState = 'idle';
  role: 'host' | 'guest' | null = null;

  onMessage(h: MessageHandler): () => void {
    this.handlers.add(h);
    return () => this.handlers.delete(h);
  }

  onStateChange(h: StateHandler): () => void {
    this.stateHandlers.add(h);
    return () => this.stateHandlers.delete(h);
  }

  private setState(s: LinkState): void {
    this.state = s;
    this.stateHandlers.forEach((h) => h(s));
  }

  private newPeer(): RTCPeerConnection {
    // Sin STUN: en la misma WiFi los candidatos host son suficientes.
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') this.setState('connected');
      else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        if (this.state === 'connected') this.setState('lost');
      }
    };
    return pc;
  }

  private wireChannel(ch: RTCDataChannel): void {
    this.channel = ch;
    ch.onopen = () => {
      this.setState('connected');
      this.pingTimer = setInterval(() => this.send({ t: 'ping' }), 10_000);
    };
    ch.onclose = () => {
      if (this.pingTimer) clearInterval(this.pingTimer);
      if (this.state === 'connected') this.setState('lost');
    };
    ch.onmessage = (e) => {
      try {
        const msg = JSON.parse(String(e.data)) as CoopMessage;
        if (msg.t !== 'ping') this.handlers.forEach((h) => h(msg));
      } catch {
        /* mensaje corrupto: ignorar */
      }
    };
  }

  /** Espera a que termine la recolección ICE (candidatos locales de la WiFi). */
  private waitIce(pc: RTCPeerConnection): Promise<void> {
    if (pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener('icegatheringstatechange', check);
          resolve();
        }
      };
      pc.addEventListener('icegatheringstatechange', check);
      setTimeout(resolve, 3000); // tope de espera
    });
  }

  /** HOST: crea el ancla de la partida. */
  async createAnchor(): Promise<string> {
    this.role = 'host';
    this.setState('anchoring');
    this.pc = this.newPeer();
    this.wireChannel(this.pc.createDataChannel('renacer'));
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    await this.waitIce(this.pc);
    return encodePayload(CODE_PREFIX.offer, this.pc.localDescription);
  }

  /** GUEST: acepta el ancla y devuelve el código de unión. */
  async acceptAnchor(anchorCode: string): Promise<string> {
    this.role = 'guest';
    this.setState('connecting');
    this.pc = this.newPeer();
    this.pc.ondatachannel = (e) => this.wireChannel(e.channel);
    const offer = decodePayload<RTCSessionDescriptionInit>(CODE_PREFIX.offer, anchorCode);
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await this.waitIce(this.pc);
    return encodePayload(CODE_PREFIX.answer, this.pc.localDescription);
  }

  /** HOST: completa el enlace con el código de unión del invitado. */
  async completeLink(answerCode: string): Promise<void> {
    if (!this.pc) throw new Error('no_anchor');
    this.setState('connecting');
    const answer = decodePayload<RTCSessionDescriptionInit>(CODE_PREFIX.answer, answerCode);
    await this.pc.setRemoteDescription(answer);
  }

  send(msg: CoopMessage): boolean {
    if (this.channel?.readyState === 'open') {
      this.channel.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  close(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.channel?.close();
    this.pc?.close();
    this.channel = null;
    this.pc = null;
    this.role = null;
    this.setState('idle');
  }
}

/** Singleton del enlace (una pareja por dispositivo). */
export const coopLink = new CoopLink();
