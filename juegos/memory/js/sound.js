// Sonidos sencillos con Web Audio (sin archivos). Con botón para silenciar.
// [PENDENT] cambiar por sonidos de licencia libre si se prefieren.

let ctx = null;
let muted = false;
try { muted = localStorage.getItem("cerda_muted") === "1"; } catch { /* nada */ }

export const isMuted = () => muted;
export function setMuted(v) {
  muted = v;
  try { localStorage.setItem("cerda_muted", v ? "1" : "0"); } catch { /* nada */ }
}

function tone(freq, start, length, type = "sine", volume = 0.15) {
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + length);
}

const SOUNDS = {
  flip: () => tone(520, 0, 0.06, "triangle"),
  match: () => { tone(660, 0, 0.12); tone(880, 0.1, 0.18); },
  miss: () => { tone(220, 0, 0.18, "sawtooth", 0.1); },
  combo: () => { tone(660, 0, 0.1); tone(880, 0.08, 0.1); tone(1100, 0.16, 0.2); },
  lupa: () => { tone(900, 0, 0.1); tone(1200, 0.1, 0.25); },
  trampa: () => { tone(300, 0, 0.12, "square", 0.08); tone(200, 0.1, 0.2, "square", 0.08); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25)),
  lose: () => [330, 262, 196].forEach((f, i) => tone(f, i * 0.15, 0.3, "sawtooth", 0.1)),
};

export function play(name) {
  if (muted) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    SOUNDS[name]?.();
  } catch { /* sin audio: no pasa nada */ }
}
