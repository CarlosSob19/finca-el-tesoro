// Sintetiza la música y los efectos del video en WAV de 16 bits (sin descargas, siempre igual).
// uso: node scripts/sonidos.js
const fs = require('fs');
const path = require('path');

const SR = 44100;
const OUT = path.join(__dirname, '..', 'public', 'sfx');
fs.mkdirSync(OUT, { recursive: true });

function wav(nombre, muestras) {
  // normaliza al -1 dBFS para que nada sature
  let max = 0;
  for (const v of muestras) max = Math.max(max, Math.abs(v));
  const g = max > 0 ? 0.89 / max : 1;
  const buf = Buffer.alloc(44 + muestras.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + muestras.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(muestras.length * 2, 40);
  muestras.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * g)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(OUT, nombre), buf);
}

// ruido determinista
let semilla = 12345;
const ruido = () => { semilla = (semilla * 1103515245 + 12345) & 0x7fffffff; return semilla / 0x3fffffff - 1; };
const nota = (n) => 440 * Math.pow(2, (n - 69) / 12);

// ---------- efectos ----------
function whoosh(dur = 0.55) {
  const n = Math.floor(SR * dur), s = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const corte = 0.02 + 0.25 * Math.sin(Math.PI * t);      // el filtro abre y cierra
    lp += corte * (ruido() - lp);
    s[i] = lp * Math.sin(Math.PI * t) ** 1.5;
  }
  return s;
}
function pop() {
  const n = Math.floor(SR * 0.16), s = new Float32Array(n);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    fase += 2 * Math.PI * (900 * Math.exp(-t * 28) + 180) / SR;
    s[i] = Math.sin(fase) * Math.exp(-t * 30);
  }
  return s;
}
function tick() {
  const n = Math.floor(SR * 0.04), s = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; s[i] = (Math.sin(2 * Math.PI * 2400 * t) * 0.6 + ruido() * 0.4) * Math.exp(-t * 160); }
  return s;
}
function golpe() {
  const n = Math.floor(SR * 0.7), s = new Float32Array(n);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    fase += 2 * Math.PI * (55 + 90 * Math.exp(-t * 18)) / SR;
    s[i] = Math.sin(fase) * Math.exp(-t * 5.5) + ruido() * 0.08 * Math.exp(-t * 40);
  }
  return s;
}
function brillo() {
  const n = Math.floor(SR * 1.4), s = new Float32Array(n);
  const notas = [84, 88, 91, 96];
  for (let i = 0; i < n; i++) {
    const t = i / SR; let v = 0;
    notas.forEach((m, k) => { const t0 = k * 0.07; if (t > t0) v += Math.sin(2 * Math.PI * nota(m) * (t - t0)) * Math.exp(-(t - t0) * 3.2); });
    s[i] = v * 0.25;
  }
  return s;
}
function mensaje() {
  // dos tonos, como una notificación
  const n = Math.floor(SR * 0.5), s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const a = t < 0.12 ? Math.sin(2 * Math.PI * nota(81) * t) * Math.exp(-t * 18) : 0;
    const b = t >= 0.1 ? Math.sin(2 * Math.PI * nota(88) * (t - 0.1)) * Math.exp(-(t - 0.1) * 9) : 0;
    s[i] = a * 0.8 + b;
  }
  return s;
}

// ---------- música: 100 BPM, guitarra punteada + bajo + bombo suave + maracas ----------
function musica(seg = 41) {
  const n = Math.floor(SR * seg), s = new Float32Array(n);
  const BPM = 100, beat = 60 / BPM;
  // I - V - vi - IV en Sol, un acorde por compás de 4 tiempos
  const acordes = [[55, 59, 62, 67], [50, 54, 57, 62], [52, 55, 59, 64], [48, 52, 55, 60]];
  const bajos = [43, 38, 40, 36];
  // guitarra: Karplus-Strong, rasgueo en corcheas con acento caribeño (3+3+2)
  const patron = [0, 1.5, 3, 3.5];
  const cuerdas = [];
  const totalTiempos = Math.floor(seg / beat);
  for (let tb = 0; tb < totalTiempos; tb += 4) {
    const compas = Math.floor(tb / 4), ac = acordes[compas % 4];
    patron.forEach((off, k) => ac.forEach((m, j) => cuerdas.push({ t: (tb + off) * beat + j * 0.012, f: nota(m + 12), vol: k === 0 ? 0.32 : 0.2 })));
  }
  for (const c of cuerdas) {
    const ini = Math.floor(c.t * SR), L = Math.max(2, Math.floor(SR / c.f));
    const linea = new Float32Array(L).map(() => ruido());
    const largo = Math.min(n - ini, Math.floor(SR * 1.6));
    let idx = 0;
    for (let i = 0; i < largo; i++) {
      const sig = (idx + 1) % L;
      const v = linea[idx];
      linea[idx] = 0.497 * (linea[idx] + linea[sig]);
      idx = sig;
      s[ini + i] += v * c.vol;
    }
  }
  for (let i = 0; i < n; i++) {
    const t = i / SR, pos = t / beat, tiempo = Math.floor(pos), dentro = (pos - tiempo) * beat;
    const compas = Math.floor(tiempo / 4);
    // bajo: raíz en 1 y 3
    if (tiempo % 2 === 0) s[i] += Math.sin(2 * Math.PI * nota(bajos[compas % 4]) * dentro) * Math.exp(-dentro * 3) * 0.55;
    // bombo suave en 1 y 3
    if (tiempo % 2 === 0) s[i] += Math.sin(2 * Math.PI * (50 + 60 * Math.exp(-dentro * 30)) * dentro) * Math.exp(-dentro * 9) * 0.5;
    // maracas en corcheas
    const corchea = (pos * 2) % 1 * (beat / 2);
    s[i] += ruido() * Math.exp(-corchea * 70) * (Math.floor(pos * 2) % 2 ? 0.05 : 0.09);
  }
  // entrada y salida suaves
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    s[i] *= Math.min(1, t / 1.2) * Math.min(1, (seg - t) / 2.5);
  }
  return s;
}

wav('whoosh.wav', whoosh());
wav('whoosh-corto.wav', whoosh(0.3));
wav('pop.wav', pop());
wav('tick.wav', tick());
wav('golpe.wav', golpe());
wav('brillo.wav', brillo());
wav('mensaje.wav', mensaje());
wav('musica.wav', musica());
console.log('sonidos listos:', fs.readdirSync(OUT).join(', '));
