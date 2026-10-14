// Escena 6: la promesa y la firma.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { BgMesh } from "../components/capas";
import { Entrance, WordReveal } from "../components/anim";

export const BRILLO = 50;
export const FIRMA = 104;

export const Cierre: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sub = spring({ frame: frame - (BRILLO + 12), fps, config: theme.spring.smooth });
  const respira = 1 + Math.sin(frame / 22) * 0.012;
  const negro = interpolate(frame, [dur - 18, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.in });
  const firma = spring({ frame: frame - FIRMA, fps, config: theme.spring.smooth });
  return (
    <AbsoluteFill>
      <BgMesh />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", paddingBottom: 380, textAlign: "center" }}
      >
        <WordReveal
          text="Su página propia."
          delay={4}
          style={{ fontFamily: theme.fonts.display, fontSize: 104, lineHeight: 1.05, color: theme.colors.text, justifyContent: "center" }}
        />
        <WordReveal
          text="Reservas directas a su WhatsApp."
          delay={24}
          per={2}
          gap={16}
          style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 54, color: theme.colors.text, justifyContent: "center", marginTop: 40, maxWidth: 900 }}
        />
        <div style={{ position: "relative", marginTop: 40, transform: `scale(${respira})` }}>
          <WordReveal
            text="Sin comisión por reserva."
            delay={BRILLO}
            gap={18}
            marcar={[0, 1, 2, 3]}
            style={{ fontFamily: theme.fonts.display, fontSize: 76, color: theme.colors.text, justifyContent: "center", textShadow: `0 0 50px ${theme.colors.glow}` }}
          />
          <div
            style={{
              position: "absolute", left: 0, right: 0, bottom: -10, height: 10, borderRadius: 5,
              background: theme.colors.primary, transformOrigin: "0 50%", transform: `scaleX(${sub})`,
            }}
          />
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute", left: 80, right: 80, top: 1290, padding: "40px 48px", borderRadius: 40,
          background: "rgba(247,248,244,0.06)", border: "1px solid rgba(247,248,244,0.16)",
          display: "flex", alignItems: "center", gap: 36,
          opacity: interpolate(firma, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(firma, [0, 1], [60, 0])}px) scale(${interpolate(firma, [0, 1], [0.94, 1])})`,
        }}
      >
        <svg width={120} height={120} viewBox="0 0 64 64">
          <rect width={64} height={64} rx={16} fill={theme.colors.river} />
          <circle cx={48} cy={16} r={7} fill={theme.colors.primary} />
          <path d="M6 40 22 26h20l16 14Z" fill="#d9a441" />
          <rect x={14} y={40} width={36} height={16} fill={theme.colors.text} />
          <rect x={28} y={44} width={8} height={12} fill={theme.colors.accent} />
          <rect x={0} y={56} width={64} height={8} fill={theme.colors.leaf} />
        </svg>
        <div>
          <Entrance delay={FIRMA + 6} dy={16}>
            <div style={{ fontFamily: theme.fonts.display, fontSize: 64, color: theme.colors.text, lineHeight: 1.05 }}>Carlos Sobrado</div>
          </Entrance>
          <Entrance delay={FIRMA + 11} dy={16}>
            <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 34, color: theme.colors.text, marginTop: 8 }}>Páginas web · Montería</div>
          </Entrance>
          <Entrance delay={FIRMA + 16} dy={16}>
            <div style={{ fontFamily: theme.fonts.body, fontSize: 28, color: theme.colors.textDim, marginTop: 6 }}>Universidad Cooperativa de Colombia</div>
          </Entrance>
        </div>
      </div>
      <Entrance delay={FIRMA + 24} dy={12}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", fontFamily: theme.fonts.body, fontSize: 26, color: "rgba(247,248,244,0.5)" }}>
          Muestra preparada para la Casafinca El Tesoro del Sinú
        </div>
      </Entrance>
      <AbsoluteFill style={{ background: "#000", opacity: negro }} />
    </AbsoluteFill>
  );
};
