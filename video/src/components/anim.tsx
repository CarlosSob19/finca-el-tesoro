// Movimientos reutilizables: entrada con resorte, palabras escalonadas, Ken Burns, salida de escena y contador.
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// entra subiendo, creciendo y apareciendo a la vez
export const Entrance: React.FC<{
  delay?: number; dy?: number; from?: number; children: React.ReactNode; style?: React.CSSProperties;
  config?: keyof typeof theme.spring;
}> = ({ delay = 0, dy = 40, from = 0.94, children, style, config = "smooth" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring[config] });
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
        transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px) scale(${interpolate(p, [0, 1], [from, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// palabra por palabra; `marcar` resalta las palabras de esos índices con el color protagonista
export const WordReveal: React.FC<{
  text: string; delay?: number; per?: number; style?: React.CSSProperties; gap?: number;
  marcar?: number[]; colorMarca?: string; subrayar?: number[]; demoraSubrayado?: number;
}> = ({ text, delay = 0, per = 3, style, gap = 22, marcar = [], colorMarca = theme.colors.primary, subrayar = [], demoraSubrayado = 14 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: gap, ...style }}>
      {text.split(" ").map((word, i) => {
        const p = spring({ frame: frame - delay - i * per, fps, config: theme.spring.snappy });
        // subrayado que se dibuja de izquierda a derecha después de que la palabra aterriza
        const s = spring({ frame: frame - delay - i * per - demoraSubrayado, fps, config: theme.spring.smooth });
        const sub = subrayar.includes(i);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
              transform: `translateY(${interpolate(p, [0, 1], [46, 0])}px) rotate(${interpolate(p, [0, 1], [4, 0])}deg)`,
              color: marcar.includes(i) ? colorMarca : undefined,
              backgroundImage: sub ? `linear-gradient(${colorMarca}, ${colorMarca})` : undefined,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 96%",
              backgroundSize: sub ? `${s * 100}% 0.1em` : undefined,
              paddingBottom: sub ? "0.08em" : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// toda foto fija se mueve: acercamiento lento + paneo
export const KenBurns: React.FC<{
  src: string; dur: number; desde?: number; hasta?: number; pan?: number; posicion?: string; style?: React.CSSProperties;
}> = ({ src, dur, desde = 1, hasta = 1.1, pan = -24, posicion = "50% 50%", style }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, dur], [desde, hasta], { ...clamp, easing: theme.ease.inOut });
  const x = interpolate(frame, [0, dur], [0, pan], { ...clamp, easing: theme.ease.inOut });
  return (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%", height: "100%", objectFit: "cover", objectPosition: posicion,
        transform: `scale(${scale}) translateX(${x}px)`, ...style,
      }}
    />
  );
};

// salida rápida de toda la escena: sube un poco, se encoge y se desvanece en ~10 cuadros
export const SalidaEscena: React.FC<{ dur: number; children: React.ReactNode; largo?: number }> = ({ dur, children, largo = 10 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [dur - largo, dur], [0, 1], { ...clamp, easing: theme.ease.in });
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        opacity: 1 - t,
        transform: `translateY(${-50 * t}px) scale(${1 - 0.06 * t})`,
        filter: `blur(${t * 8}px)`,
      }}
    >
      {children}
    </div>
  );
};

// número que sube con resorte, sin saltos de ancho
export const useConteo = (desde: number, hasta: number, delay: number, rigidez = 60) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: rigidez } });
  return interpolate(p, [0, 1], [desde, hasta]);
};

export const pesos = (v: number) => "$" + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
