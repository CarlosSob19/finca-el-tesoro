// Escena 3: un día en la finca, de 9 a. m. a 5 p. m., una foto real por momento.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { BgMesh } from "../components/capas";
import { Entrance, KenBurns, SalidaEscena } from "../components/anim";

export const MOMENTOS = [
  { hora: "9:00 a. m.", titulo: "Se abre el portón", foto: "porton", pos: "50% 50%" },
  { hora: "10:00 a. m.", titulo: "Primer chapuzón", foto: "piscina", pos: "50% 70%" },
  { hora: "12:00 m.", titulo: "Quince en el jacuzzi", foto: "jacuzzi", pos: "50% 50%" },
  { hora: "1:00 p. m.", titulo: "El asado", foto: "fachada-asador", pos: "40% 50%" },
  { hora: "3:00 p. m.", titulo: "Hamaca bajo los mangos", foto: "hamacas-arboles", pos: "50% 50%" },
  { hora: "5:00 p. m.", titulo: "La foto del grupo", foto: "kiosco-sombrillas", pos: "50% 40%" },
] as const;

const SALIDA = 12;

const Tarjeta: React.FC<{ i: number; largo: number }> = ({ i, largo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MOMENTOS[i];
  const entra = spring({ frame, fps, config: theme.spring.smooth });
  const ultimo = i === MOMENTOS.length - 1;
  // sale hacia la izquierda, más rápido de lo que entró
  const sale = ultimo ? 0 : interpolate(frame, [largo, largo + SALIDA], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.in,
  });
  const x = interpolate(entra, [0, 1], [1150, 0]) - sale * 1200;
  const giro = interpolate(entra, [0, 1], [7, 0]) - sale * 6;
  const pill = spring({ frame: frame - 7, fps, config: theme.spring.bouncy });
  const tit = spring({ frame: frame - 11, fps, config: theme.spring.snappy });
  return (
    <div
      style={{
        position: "absolute", left: 80, top: 360, width: 920, height: 1160, borderRadius: 48, overflow: "hidden",
        boxShadow: "0 50px 100px -30px rgba(0,0,0,0.75)", border: "1px solid rgba(247,248,244,0.1)",
        transform: `translateX(${x}px) rotate(${giro}deg) scale(${interpolate(entra, [0, 1], [0.9, 1])})`,
        filter: `blur(${sale * 6}px)`,
      }}
    >
      <KenBurns src={`fotos/${m.foto}.jpg`} dur={largo + SALIDA} desde={i % 2 ? 1.12 : 1.02} hasta={i % 2 ? 1.02 : 1.12} pan={i % 2 ? 20 : -20} posicion={m.pos} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 50%, rgba(28,24,19,0.88) 100%)" }} />
      <div style={{ position: "absolute", left: 56, bottom: 64, right: 56 }}>
        <div
          style={{
            display: "inline-block", padding: "12px 26px", borderRadius: 999,
            background: theme.colors.primary, color: theme.colors.ink,
            fontFamily: theme.fonts.display, fontSize: 40, marginBottom: 22,
            boxShadow: `0 0 40px ${theme.colors.glow}`,
            opacity: interpolate(pill, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(pill, [0, 1], [24, 0])}px) scale(${interpolate(pill, [0, 1], [0.7, 1])})`,
          }}
        >
          {m.hora}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.display, fontSize: 82, lineHeight: 1.02, color: theme.colors.text,
            opacity: interpolate(tit, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(tit, [0, 1], [36, 0])}px)`,
          }}
        >
          {m.titulo}
        </div>
      </div>
    </div>
  );
};

const Linea: React.FC<{ largo: number }> = ({ largo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const activo = Math.min(MOMENTOS.length - 1, Math.floor(frame / largo));
  const aparece = spring({ frame: frame - 10, fps, config: theme.spring.smooth });
  const avance = interpolate(frame, [0, largo * MOMENTOS.length], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  return (
    <div
      style={{
        position: "absolute", left: 120, right: 120, top: 1610,
        opacity: aparece, transform: `translateY(${interpolate(aparece, [0, 1], [30, 0])}px)`,
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 11, height: 3, background: "rgba(247,248,244,0.18)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 11, height: 3, background: theme.colors.text, transformOrigin: "0 50%", transform: `scaleX(${avance})` }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {MOMENTOS.map((m, i) => {
          const s = spring({ frame: frame - i * largo, fps, config: theme.spring.bouncy });
          const encendido = i <= activo;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 0 }}>
              <div
                style={{
                  width: 26, height: 26, borderRadius: 13,
                  background: encendido ? theme.colors.text : theme.colors.bg,
                  border: `3px solid ${encendido ? theme.colors.text : "rgba(247,248,244,0.35)"}`,
                  transform: `scale(${i === activo ? interpolate(s, [0, 1], [1, 1.45]) : 1})`,
                }}
              />
              <div
                style={{
                  marginTop: 18, whiteSpace: "nowrap", fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 26,
                  color: i === activo ? theme.colors.text : "rgba(247,248,244,0.45)",
                }}
              >
                {m.hora.replace(" a. m.", "").replace(" p. m.", "").replace(" m.", "")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const UnDia: React.FC<{ dur: number; largo: number }> = ({ dur, largo }) => (
  <SalidaEscena dur={dur}>
    <BgMesh />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
      <Entrance delay={2} dy={30}>
        <div style={{ fontFamily: theme.fonts.display, fontSize: 92, color: theme.colors.text, letterSpacing: "-0.01em" }}>Un día en El Tesoro</div>
      </Entrance>
      <Entrance delay={10} dy={20}>
        <div style={{ fontFamily: theme.fonts.body, fontSize: 34, color: theme.colors.textDim, marginTop: 10 }}>Así se vive un pasadía</div>
      </Entrance>
    </AbsoluteFill>
    {MOMENTOS.map((_, i) => (
      <Sequence key={i} from={i * largo} durationInFrames={largo + SALIDA} layout="none">
        <Tarjeta i={i} largo={largo} />
      </Sequence>
    ))}
    <Linea largo={largo} />
  </SalidaEscena>
);
