// Las personas pintadas sobre el prado, con la misma lógica de la página: estaturas reales,
// perspectiva, grupitos y ninguna figura repetida antes de usarlas todas.
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

const FIGURAS: [number, number][] = [
  [1, 399], [2, 382], [3, 385], [4, 396], [5, 300], [6, 321], [7, 370], [8, 395], [10, 372],
  [11, 378], [12, 263], [13, 374], [14, 384], [16, 378], [17, 399], [18, 403], [19, 398], [20, 347],
  [21, 396], [22, 383], [23, 395], [24, 402], [25, 391], [26, 377], [27, 386], [28, 394], [29, 321],
  [30, 384], [32, 386],
];
const ADULTO = 396, ALTO_FRENTE = 30, PIE_ATRAS = 31;

type Puesto = { x: number; prof: number; figura: [number, number]; espejo: boolean };

const puestos: Puesto[] = (() => {
  let semilla = 13;
  const azar = () => { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; };
  const lista: { x: number; prof: number }[] = [];
  const libre = (x: number, prof: number) => {
    const ancho = 3.2 * (1 - 0.55 * prof);
    return !lista.some((p) => Math.abs(p.prof - prof) < 0.08 && Math.abs(p.x - x) < ancho);
  };
  let intentos = 0;
  while (lista.length < 80 && intentos < 6000) {
    intentos++;
    const avance = lista.length / 80;
    const prof = Math.min(0.98, Math.pow(azar(), 1.6 - avance) * (0.35 + avance * 0.75));
    const abierto = 20 + avance * 42;
    const cx = 50 + (azar() - 0.5) * 2 * abierto;
    const tam = 2 + Math.floor(azar() * 3);
    for (let k = 0; k < tam && lista.length < 80; k++) {
      const x = cx + (k - (tam - 1) / 2) * 3.4 * (1 - 0.5 * prof) + (azar() - 0.5) * 1.5;
      const pr = Math.max(0, Math.min(1, prof + (azar() - 0.5) * 0.06));
      if (x < 4 || x > 96 || !libre(x, pr)) continue;
      lista.push({ x, prof: pr });
    }
  }
  let orden: [number, number][] = [];
  while (orden.length < lista.length) {
    const ciclo = FIGURAS.slice();
    for (let j = ciclo.length - 1; j > 0; j--) {
      const r = Math.floor(azar() * (j + 1));
      [ciclo[j], ciclo[r]] = [ciclo[r], ciclo[j]];
    }
    if (orden.length && ciclo[0] === orden[orden.length - 1]) ciclo.push(ciclo.shift()!);
    orden = orden.concat(ciclo);
  }
  return lista.map((p, i) => ({
    ...p,
    figura: orden[i],
    espejo: Math.floor(i / FIGURAS.length) % 2 === 1 ? azar() < 0.7 : azar() < 0.25,
  }));
})();

// `cuantas` puede ser fraccionario: cada persona entra con su resorte cuando el conteo la alcanza
export const Gente: React.FC<{ cuantas: number; llegadas: number[] }> = ({ cuantas, llegadas }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.min(80, Math.floor(cuantas));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {puestos.slice(0, n).map((p, i) => {
        const escala = 1 - 0.55 * p.prof;
        const s = spring({ frame: frame - (llegadas[i] ?? 0), fps, config: theme.spring.bouncy });
        const alto = ALTO_FRENTE * escala * p.figura[1] / ADULTO;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              bottom: `${2 + p.prof * (PIE_ATRAS - 2)}%`,
              height: `${alto}%`,
              zIndex: 1000 - Math.round(p.prof * 900),
              transformOrigin: "50% 100%",
              transform: `translateX(-50%) translateY(${interpolate(s, [0, 1], [18, 0])}%) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
              opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            {/* sombra en el suelo, inclinada como la de la casa */}
            <div
              style={{
                position: "absolute", bottom: "-2%", left: "50%", width: "150%", height: "9%",
                transform: "translateX(-30%) skewX(-40deg)",
                background: "radial-gradient(closest-side, rgba(28,24,19,0.5), rgba(28,24,19,0.18) 60%, rgba(28,24,19,0))",
              }}
            />
            <Img
              src={staticFile(`gente/persona-${String(p.figura[0]).padStart(2, "0")}.webp`)}
              style={{
                position: "relative", height: "100%", width: "auto",
                transform: p.espejo ? "scaleX(-1)" : undefined,
                filter: "saturate(0.82) contrast(0.9) brightness(1.02) sepia(0.06) drop-shadow(-2px 2px 1.5px rgba(28,24,19,0.28))",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
