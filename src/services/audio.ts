/**
 * SONIDO (§107) + HAPTICS (§106) — opcionales y desactivables.
 * Efectos sintetizados con WebAudio (cero assets, cero peso, offline).
 * Vibración sutil donde la plataforma lo permita (Android; iOS la ignora).
 */

type SfxName =
  | 'ui'          // toque de interfaz
  | 'page'        // pasar página narrativa
  | 'hit'         // golpe físico
  | 'spell'       // hechizo
  | 'heal'        // curación
  | 'hurt'        // daño recibido
  | 'victory'     // victoria
  | 'defeat'      // derrota
  | 'combo'       // combo cooperativo
  | 'dice'        // dados del destino
  | 'alert';      // ventana de reacción

let ctx: AudioContext | null = null;
let soundOn = localStorage.getItem('sound_on') !== '0';
let hapticsOn = localStorage.getItem('haptics_on') !== '0';

export function isSoundOn(): boolean { return soundOn; }
export function isHapticsOn(): boolean { return hapticsOn; }
export function setSoundOn(v: boolean): void { soundOn = v; localStorage.setItem('sound_on', v ? '1' : '0'); }
export function setHapticsOn(v: boolean): void { hapticsOn = v; localStorage.setItem('haptics_on', v ? '1' : '0'); }

function ac(): AudioContext | null {
  if (!soundOn) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, durMs: number, type: OscillatorType, gain: number, delayMs = 0, slideTo?: number): void {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delayMs / 1000;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + durMs / 1000);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + durMs / 1000 + 0.05);
}

function noise(durMs: number, gain: number, delayMs = 0): void {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delayMs / 1000;
  const len = Math.floor((durMs / 1000) * a.sampleRate);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  const g = a.createGain();
  g.gain.value = gain;
  src.buffer = buf;
  src.connect(g).connect(a.destination);
  src.start(t0);
}

function vibrate(pattern: number | number[]): void {
  if (!hapticsOn) return;
  try {
    navigator.vibrate?.(pattern);
  } catch { /* no soportado */ }
}

export function sfx(name: SfxName): void {
  switch (name) {
    case 'ui':
      tone(660, 60, 'sine', 0.06);
      break;
    case 'page':
      noise(120, 0.03);
      tone(440, 80, 'sine', 0.03, 30);
      break;
    case 'hit':
      noise(90, 0.12);
      tone(150, 120, 'square', 0.08, 0, 60);
      vibrate(18);
      break;
    case 'spell':
      tone(520, 220, 'sine', 0.07, 0, 1040);
      tone(780, 180, 'triangle', 0.05, 60, 1560);
      vibrate(12);
      break;
    case 'heal':
      tone(523, 140, 'sine', 0.06);
      tone(659, 140, 'sine', 0.06, 90);
      tone(784, 200, 'sine', 0.06, 180);
      break;
    case 'hurt':
      tone(220, 160, 'sawtooth', 0.08, 0, 110);
      vibrate([20, 30, 20]);
      break;
    case 'victory':
      tone(523, 160, 'triangle', 0.08);
      tone(659, 160, 'triangle', 0.08, 130);
      tone(784, 160, 'triangle', 0.08, 260);
      tone(1046, 320, 'triangle', 0.09, 390);
      vibrate([15, 40, 15, 40, 30]);
      break;
    case 'defeat':
      tone(392, 300, 'sine', 0.07, 0, 196);
      tone(311, 420, 'sine', 0.07, 200, 155);
      vibrate(60);
      break;
    case 'combo':
      tone(660, 100, 'square', 0.06);
      tone(880, 100, 'square', 0.06, 80);
      tone(1320, 200, 'square', 0.07, 160);
      vibrate([10, 20, 10, 20, 25]);
      break;
    case 'dice':
      for (let i = 0; i < 5; i++) noise(40, 0.05, i * 90);
      tone(880, 250, 'triangle', 0.08, 500);
      vibrate([8, 40, 8, 40, 8]);
      break;
    case 'alert':
      tone(988, 90, 'square', 0.07);
      tone(988, 90, 'square', 0.07, 140);
      vibrate(25);
      break;
  }
}
