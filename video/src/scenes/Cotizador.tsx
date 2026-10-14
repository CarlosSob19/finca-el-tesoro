// Escena 4: el cotizador. Las personas llenan el prado mientras el precio sube,
// y la reserva llega armada por WhatsApp.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { BgMesh } from "../components/capas";
import { Entrance, KenBurns, pesos, SalidaEscena } from "../components/anim";
import { Gente } from "../components/gente";

// precios del pasadía por grupo (los de la página, js/tarifas.js)
const GRUPOS: [number, number][] = [[10, 400000], [15, 550000], [20, 660000], [30, 880000], [40, 990000]];
const precio = (n: number) => (GRUPOS.find(([hasta]) => n <= hasta) ?? GRUPOS[GRUPOS.length - 1])[1];

export const PERSONAS = 30;
export const INICIO_CONTEO = 26;
export const FIN_CONTEO = 120;
export const LLEGA_CHAT = 150;

// cuadro en que llega cada persona (para animarlas y para los "tic" del sonido)
export const llegadas = Array.from({ length: PERSONAS }, (_, i) =>
  Math.round(INICIO_CONTEO + (FIN_CONTEO - INICIO_CONTEO) * (1 - Math.pow(1 - (i + 1) / PERSONAS, 1.6))),
);

const LINEAS = [
  "Hola, quiero reservar en la Casafinca El Tesoro del Sinú.",
  "Plan: Pasadía",
  "Grupo: 30 personas",
  "Fecha: sábado 17 de octubre",
  "Total: $880.000 ($29.333 por persona)",
  "Abono para reservar (50%): $440.000",
];

const Chat: React.FC = () => {
  const frame = useCurrentFrame() - LLEGA_CHAT;
  const { fps } = useVideoConfig();
  const sube = spring({ frame, fps, config: theme.spring.smooth });
  const burbuja = spring({ frame: frame - 10, fps, config: theme.spring.bouncy });
  if (frame < -2) return null;
  return (
    <div
      style={{
        position: "absolute", left: 40, right: 40, bottom: 0, height: 860,
        borderRadius: "48px 48px 0 0", overflow: "hidden", background: theme.colors.chatBg,
        boxShadow: "0 -40px 90px -20px rgba(0,0,0,0.7)",
        transform: `translateY(${interpolate(sube, [0, 1], [900, 0])}px)`,
        zIndex: 20,
      }}
    >
      <div style={{ height: 130, background: "#075e54", display: "flex", alignItems: "center", gap: 24, padding: "0 40px" }}>
        <div style={{ width: 76, height: 76, borderRadius: 38, background: theme.colors.primary, display: "grid", placeItems: "center", fontFamily: theme.fonts.display, fontSize: 38, color: theme.colors.ink }}>T</div>
        <div>
          <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 38, color: "#fff" }}>Casafinca El Tesoro</div>
          <div style={{ fontFamily: theme.fonts.body, fontSize: 26, color: "rgba(255,255,255,0.75)" }}>en línea</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute", right: 44, top: 180, maxWidth: 820,
          background: theme.colors.chatBubble, borderRadius: "30px 8px 30px 30px", padding: "30px 34px 22px",
          boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
          transformOrigin: "100% 0%",
          opacity: interpolate(burbuja, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(burbuja, [0, 1], [0.6, 1])}) translateY(${interpolate(burbuja, [0, 1], [30, 0])}px)`,
        }}
      >
        {LINEAS.map((l, i) => {
          const p = spring({ frame: frame - 16 - i * 5, fps, config: theme.spring.snappy });
          return (
            <div
              key={i}
              style={{
                fontFamily: theme.fonts.body, fontSize: 34, lineHeight: 1.4, color: "#111b21",
                fontWeight: i === 0 ? 500 : 400, marginBottom: i === 0 ? 14 : 0,
                opacity: interpolate(p, [0, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                transform: `translateX(${interpolate(p, [0, 1], [24, 0])}px)`,
              }}
            >
              {l}
            </div>
          );
        })}
        <div style={{ textAlign: "right", fontFamily: theme.fonts.body, fontSize: 24, color: "#667781", marginTop: 10 }}>
          10:24 a. m. <span style={{ color: "#53bdeb", fontWeight: 700 }}>✓✓</span>
        </div>
      </div>
    </div>
  );
};

export const Cotizador: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.min(PERSONAS, llegadas.filter((f) => f <= frame).length);
  const tarjeta = spring({ frame: frame - 4, fps, config: theme.spring.smooth });
  const total = precio(Math.max(1, n));
  // cada vez que cambia de grupo, el precio da un pequeño salto
  const ultimoSalto = [...llegadas.keys()].reverse().find((i) => i > 0 && llegadas[i] <= frame && precio(i + 1) !== precio(i));
  const salto = spring({ frame: frame - (ultimoSalto !== undefined ? llegadas[ultimoSalto] : -100), fps, config: theme.spring.bouncy });
  return (
    <SalidaEscena dur={dur}>
      <BgMesh />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
        <Entrance delay={2} dy={30}>
          <div style={{ fontFamily: theme.fonts.display, fontSize: 92, color: theme.colors.text }}>Arme su paseo</div>
        </Entrance>
        <Entrance delay={10} dy={20}>
          <div style={{ fontFamily: theme.fonts.body, fontSize: 34, color: theme.colors.textDim, marginTop: 10 }}>Escoge el plan y cuántos van</div>
        </Entrance>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute", left: 60, top: 330, width: 960, height: 768, borderRadius: 44, overflow: "hidden",
          boxShadow: "0 50px 100px -30px rgba(0,0,0,0.75)", border: "1px solid rgba(247,248,244,0.1)",
          opacity: interpolate(tarjeta, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(tarjeta, [0, 1], [80, 0])}px) scale(${interpolate(tarjeta, [0, 1], [0.92, 1])})`,
        }}
      >
        <KenBurns src="fotos/casa-prado.jpg" dur={dur} desde={1} hasta={1.05} pan={-10} posicion="50% 80%" />
        <Gente cuantas={n} llegadas={llegadas} />
        <div
          style={{
            position: "absolute", top: 26, left: 26, zIndex: 2000, padding: "12px 24px", borderRadius: 18,
            background: theme.colors.bg, color: theme.colors.text, display: "flex", alignItems: "baseline", gap: 12,
            fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 30,
          }}
        >
          <span style={{ fontFamily: theme.fonts.display, fontSize: 58, fontVariantNumeric: "tabular-nums", minWidth: 70, textAlign: "right" }}>
            {n}
          </span>
          personas
        </div>
      </div>

      <div style={{ position: "absolute", left: 80, right: 80, top: 1160 }}>
        <Entrance delay={20} dy={24}>
          <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 34, color: theme.colors.textDim }}>Pasadía de 8 horas</div>
        </Entrance>
        <Entrance delay={26} dy={30}>
          <div
            style={{
              fontFamily: theme.fonts.display, fontSize: 150, lineHeight: 1.05, color: theme.colors.primary,
              fontVariantNumeric: "tabular-nums", textShadow: `0 0 60px ${theme.colors.glow}`,
              transform: `scale(${interpolate(salto, [0, 0.5, 1], [1, 1.06, 1])})`, transformOrigin: "0 70%",
            }}
          >
            {pesos(total)}
          </div>
        </Entrance>
        <Entrance delay={34} dy={20}>
          <div style={{ fontFamily: theme.fonts.body, fontSize: 40, color: theme.colors.text, marginTop: 6 }}>
            sale a <b>{pesos(total / Math.max(1, n))}</b> por persona
          </div>
        </Entrance>
      </div>

      <Chat />
    </SalidaEscena>
  );
};
