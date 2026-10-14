// Escena 2: la página real dentro de un celular, desplazándose sola.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { BgMesh } from "../components/capas";
import { Entrance, SalidaEscena, WordReveal } from "../components/anim";

const ANCHO_PANTALLA = 600;
const ALTO_PANTALLA = 1180;
// captura de 390 x 2400 px de la página en el celular, guardada a 2,5x
const ALTO_CAPTURA = (2400 / 390) * ANCHO_PANTALLA;

const Etiqueta: React.FC<{ texto: string; delay: number; lado: "izq" | "der"; top: number }> = ({ texto, delay, lado, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.bouncy });
  const flota = Math.sin((frame + delay * 3) / 26) * 5;
  return (
    <div
      style={{
        position: "absolute", top, [lado === "izq" ? "left" : "right"]: 54,
        padding: "18px 28px", borderRadius: 22, background: theme.colors.text, color: theme.colors.ink,
        fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 34,
        boxShadow: "0 24px 50px -18px rgba(0,0,0,0.6)",
        opacity: interpolate(p, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(p, [0, 1], [30, 0]) + flota}px) scale(${interpolate(p, [0, 1], [0.7, 1])}) rotate(${lado === "izq" ? -3 : 3}deg)`,
        zIndex: 5,
      }}
    >
      {texto}
    </div>
  );
};

export const Pagina: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: frame - 6, fps, config: theme.spring.smooth });
  const flota = Math.sin(frame / 30) * 6;
  const scroll = interpolate(frame, [34, dur - 14], [0, -(ALTO_CAPTURA - ALTO_PANTALLA) * 0.62], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut,
  });
  return (
    <SalidaEscena dur={dur}>
      <BgMesh />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <WordReveal
          text="Así se vería su página"
          delay={4}
          marcar={[4]}
          style={{ fontFamily: theme.fonts.display, fontSize: 84, color: theme.colors.text, justifyContent: "center", maxWidth: 900, textAlign: "center", lineHeight: 1.05 }}
        />
        <Entrance delay={16} dy={20}>
          <div style={{ fontFamily: theme.fonts.body, fontSize: 34, color: theme.colors.textDim, marginTop: 18 }}>
            Sus fotos, sus precios y su WhatsApp
          </div>
        </Entrance>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute", left: "50%", top: 470,
          width: ANCHO_PANTALLA + 28, height: ALTO_PANTALLA + 28,
          marginLeft: -(ANCHO_PANTALLA + 28) / 2,
          borderRadius: 72, background: "#0d0b09", padding: 14,
          boxShadow: "0 60px 120px -30px rgba(0,0,0,0.75), 0 0 0 3px rgba(247,248,244,0.08)",
          opacity: interpolate(entra, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `perspective(1600px) translateY(${interpolate(entra, [0, 1], [620, 0]) + flota}px) rotateX(${interpolate(entra, [0, 1], [24, 0])}deg) scale(${interpolate(entra, [0, 1], [0.86, 1])})`,
        }}
      >
        <div style={{ position: "relative", width: ANCHO_PANTALLA, height: ALTO_PANTALLA, borderRadius: 58, overflow: "hidden", background: theme.colors.text }}>
          <Img
            src={staticFile("capturas/portada-larga.png")}
            style={{ position: "absolute", top: 0, left: 0, width: ANCHO_PANTALLA, height: ALTO_CAPTURA, transform: `translateY(${scroll}px)` }}
          />
          {/* isla de la cámara */}
          <div style={{ position: "absolute", top: 16, left: "50%", width: 150, height: 40, marginLeft: -75, borderRadius: 20, background: "#0d0b09" }} />
        </div>
      </div>

      <Etiqueta texto="Fotos reales" delay={44} lado="izq" top={820} />
      <Etiqueta texto="Precio al instante" delay={58} lado="der" top={1190} />
      <Etiqueta texto="Reserva por WhatsApp" delay={72} lado="izq" top={1500} />
    </SalidaEscena>
  );
};
