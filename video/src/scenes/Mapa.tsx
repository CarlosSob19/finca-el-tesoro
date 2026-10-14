// Escena 5: el mapa real con la ruta trazándose desde Montería hasta la finca.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { BgMesh } from "../components/capas";
import { Entrance, SalidaEscena, WordReveal } from "../components/anim";
import { mapa } from "../datos";

const ESCALA = 960 / mapa.ancho;
export const INICIO_RUTA = 24;
export const FIN_RUTA = 110;

const Punto: React.FC<{ x: number; y: number; nombre: string; avance: number; progreso: number; dx: number; dy: number; ancla?: "start" | "end" | "middle" }> = ({ x, y, nombre, avance, progreso, dx, dy, ancla = "start" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // el punto se enciende cuando la ruta lo alcanza
  const llega = INICIO_RUTA + (FIN_RUTA - INICIO_RUTA) * avance;
  const s = spring({ frame: frame - llega, fps, config: theme.spring.bouncy });
  const alcanzado = progreso >= avance - 0.001;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={16 * interpolate(s, [0, 1], [0.4, 1])} fill={theme.colors.river} stroke={alcanzado ? theme.colors.primary : "rgba(247,248,244,0.45)"} strokeWidth={5} opacity={interpolate(s, [0, 0.3], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <circle r={9 * interpolate(s, [0, 1], [0.3, 1])} fill={alcanzado ? theme.colors.primary : "rgba(247,248,244,0.45)"} />
      <text
        x={dx} y={dy} textAnchor={ancla}
        style={{ fontFamily: theme.fonts.display, fontSize: 44, paintOrder: "stroke", stroke: "#0f3d61", strokeWidth: 10, strokeLinejoin: "round" }}
        fill={theme.colors.text}
        opacity={interpolate(s, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      >
        {nombre}
      </text>
    </g>
  );
};

export const Mapa: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tarjeta = spring({ frame: frame - 6, fps, config: theme.spring.smooth });
  const progreso = interpolate(frame, [INICIO_RUTA, FIN_RUTA], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  const finca = spring({ frame: frame - FIN_RUTA, fps, config: theme.spring.bouncy });
  const pulso = ((frame - FIN_RUTA) % 40) / 40;
  const p = mapa.puntos;
  // el mapa se acerca despacio hacia la finca mientras se dibuja la ruta
  const zoom = interpolate(frame, [0, dur], [1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  return (
    <SalidaEscena dur={dur}>
      <BgMesh tono={theme.colors.pool} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <WordReveal
          text="Y llegan sin perderse"
          delay={2}
          style={{ fontFamily: theme.fonts.display, fontSize: 88, color: theme.colors.text, justifyContent: "center" }}
        />
        <div style={{ display: "flex", gap: 18, marginTop: 30 }}>
          {["15 km desde Montería", "≈ 25 min en carro"].map((t, i) => (
            <Entrance key={t} delay={14 + i * 5} dy={20} config="snappy">
              <div style={{ padding: "14px 26px", border: "2px solid rgba(247,248,244,0.35)", borderRadius: 999, fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 32, color: theme.colors.text }}>
                {t}
              </div>
            </Entrance>
          ))}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute", left: 60, top: 470, width: 960, height: mapa.alto * ESCALA, borderRadius: 44, overflow: "hidden",
          boxShadow: "0 50px 100px -30px rgba(0,0,0,0.75)", border: "1px solid rgba(247,248,244,0.1)",
          opacity: interpolate(tarjeta, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(tarjeta, [0, 1], [80, 0])}px) scale(${interpolate(tarjeta, [0, 1], [0.92, 1])})`,
          background: "#0f3d61",
        }}
      >
        <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "75% 35%" }}>
          <Img src={staticFile("mapa-base.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          <svg viewBox={`0 0 ${mapa.ancho} ${mapa.alto}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <text x={70} y={560} transform="rotate(-78 70 560)" style={{ fontFamily: theme.fonts.display, fontSize: 36, letterSpacing: "0.08em" }} fill="#8fd4e8">Río Sinú</text>
            <path d={mapa.ruta} fill="none" stroke="rgba(244,197,49,0.2)" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 16" />
            <path
              d={mapa.ruta} fill="none" stroke={theme.colors.primary} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progreso}
              style={{ filter: `drop-shadow(0 0 10px ${theme.colors.glow})` }}
            />
            <Punto x={p.monteria.x} y={p.monteria.y} nombre="Montería" avance={0} progreso={progreso} dx={26} dy={14} />
            <Punto x={p.upb.x} y={p.upb.y} nombre="UPB" avance={p.upb.avance} progreso={progreso} dx={-30} dy={14} ancla="end" />
            <Punto x={p.garzones.x} y={p.garzones.y} nombre="Garzones" avance={p.garzones.avance} progreso={progreso} dx={-10} dy={-34} ancla="middle" />
            <g transform={`translate(${p.finca.x} ${p.finca.y})`}>
              {frame > FIN_RUTA && <circle r={20 + pulso * 70} fill={theme.colors.primary} opacity={0.5 * (1 - pulso)} />}
              <g transform={`scale(${interpolate(finca, [0, 1], [0, 1.6])})`}>
                <path d="M0 0c-14-16-22-26-22-36a22 22 0 0 1 44 0c0 10-8 20-22 36Z" fill={theme.colors.accent} stroke={theme.colors.text} strokeWidth={3} />
                <path d="M-11-34 0-44l11 10v12h-22Z" fill={theme.colors.text} />
              </g>
              <text
                x={0} y={70} textAnchor="middle"
                style={{ fontFamily: theme.fonts.display, fontSize: 54, paintOrder: "stroke", stroke: "#0f3d61", strokeWidth: 12, strokeLinejoin: "round" }}
                fill={theme.colors.text}
                opacity={interpolate(finca, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              >
                El Tesoro
              </text>
            </g>
          </svg>
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, display: "flex", justifyContent: "center", gap: 20 }}>
        {["Google Maps", "Waze"].map((t, i) => (
          <Entrance key={t} delay={FIN_RUTA + 8 + i * 5} dy={24} config="snappy">
            <div style={{ padding: "20px 40px", borderRadius: 999, background: theme.colors.text, color: theme.colors.ink, fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 36 }}>
              {t}
            </div>
          </Entrance>
        ))}
      </div>
      <Entrance delay={FIN_RUTA + 20} dy={16}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1490, textAlign: "center", fontFamily: theme.fonts.body, fontSize: 32, color: theme.colors.textDim }}>
          Ruta real, con un toque desde el celular
        </div>
      </Entrance>
    </SalidaEscena>
  );
};
