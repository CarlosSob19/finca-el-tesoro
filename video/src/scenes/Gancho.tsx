// Escena 1: la casa real y la pregunta que engancha.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Entrance, KenBurns, SalidaEscena, WordReveal } from "../components/anim";

export const Gancho: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const respira = Math.sin(frame / 22) * 4;
  return (
    <SalidaEscena dur={dur}>
      <AbsoluteFill>
        <KenBurns src="fotos/casa-jacuzzi.jpg" dur={dur} desde={1.1} hasta={1.0} pan={14} posicion="50% 62%" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(28,24,19,0.55) 0%, rgba(28,24,19,0) 30%, rgba(28,24,19,0.15) 48%, rgba(28,24,19,0.92) 82%)" }} />
      <AbsoluteFill style={{ padding: "0 84px", justifyContent: "flex-end", paddingBottom: 430 }}>
        <Entrance delay={4} dy={24}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 26px", marginBottom: 40,
              border: `2px solid rgba(247,248,244,0.45)`, borderRadius: 999,
              fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 30, color: theme.colors.text, letterSpacing: "0.02em",
            }}
          >
            Casafinca El Tesoro del Sinú · Montería
          </div>
        </Entrance>
        <div style={{ transform: `translateY(${respira}px)`, maxWidth: 900 }}>
          <WordReveal
            text="¿Su finca ya tiene página propia?"
            delay={10}
            marcar={[5]}
            subrayar={[5]}
            demoraSubrayado={12}
            gap={30}
            style={{ fontFamily: theme.fonts.display, fontSize: 120, lineHeight: 1.06, color: theme.colors.text, letterSpacing: "-0.01em" }}
          />
        </div>
      </AbsoluteFill>
    </SalidaEscena>
  );
};
