// El video completo: seis escenas cortadas en el tiempo de la música, con los efectos 2-3 cuadros antes de cada golpe visual.
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "./theme";
import { Grade, Grain, Vignette } from "./components/capas";
import { Gancho } from "./scenes/Gancho";
import { Pagina } from "./scenes/Pagina";
import { MOMENTOS, UnDia } from "./scenes/UnDia";
import { Cotizador, LLEGA_CHAT, llegadas } from "./scenes/Cotizador";
import { FIN_RUTA, Mapa } from "./scenes/Mapa";
import { BRILLO, Cierre } from "./scenes/Cierre";

const B = theme.beat;
const LARGO_MOMENTO = 40;
export const ESCENAS = {
  gancho: { desde: 0, dur: 6 * B },
  pagina: { desde: 6 * B, dur: 8 * B },
  dia: { desde: 14 * B, dur: 14 * B },
  cotiza: { desde: 28 * B, dur: 16 * B },
  mapa: { desde: 44 * B, dur: 10 * B },
  cierre: { desde: 54 * B, dur: 14 * B },
};
export const DURACION = ESCENAS.cierre.desde + ESCENAS.cierre.dur;
// cada escena entra 8 cuadros antes del corte, mientras la anterior sale: nunca queda la pantalla vacía
const SOLAPE = 8;
const inicio = (s: { desde: number }) => Math.max(0, s.desde - SOLAPE);
const largo = (s: { desde: number; dur: number }) => s.dur + (s.desde - inicio(s));

// la escena que entra aparece en fundido sobre la que sale (su fondo no tapa de golpe la salida anterior)
const Cruce: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, SOLAPE + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  return <AbsoluteFill style={{ opacity: t, transform: `scale(${1.05 - 0.05 * t})` }}>{children}</AbsoluteFill>;
};

const Sfx: React.FC<{ en: number; src: string; vol?: number }> = ({ en, src, vol = 0.6 }) => (
  <Sequence from={Math.max(0, en)} durationInFrames={60} layout="none">
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={vol} />
  </Sequence>
);

export const Promo: React.FC = () => {
  const e = ESCENAS;
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <Sequence from={e.gancho.desde} durationInFrames={e.gancho.dur}><Gancho dur={e.gancho.dur} /></Sequence>
      <Sequence from={inicio(e.pagina)} durationInFrames={largo(e.pagina)}><Cruce><Pagina dur={largo(e.pagina)} /></Cruce></Sequence>
      <Sequence from={inicio(e.dia)} durationInFrames={largo(e.dia)}><Cruce><UnDia dur={largo(e.dia)} largo={LARGO_MOMENTO} /></Cruce></Sequence>
      <Sequence from={inicio(e.cotiza)} durationInFrames={largo(e.cotiza)}><Cruce><Cotizador dur={largo(e.cotiza)} /></Cruce></Sequence>
      <Sequence from={inicio(e.mapa)} durationInFrames={largo(e.mapa)}><Cruce><Mapa dur={largo(e.mapa)} /></Cruce></Sequence>
      <Sequence from={inicio(e.cierre)} durationInFrames={largo(e.cierre)}><Cruce><Cierre dur={largo(e.cierre)} /></Cruce></Sequence>

      {/* acabado encima de todo: gradación, grano y viñeta */}
      <Grade />
      <Grain />
      <Vignette />

      {/* música de fondo, baja bajo los efectos y con salida suave */}
      <Audio
        src={staticFile("sfx/musica.wav")}
        volume={(f) => interpolate(f, [0, 20, DURACION - 40, DURACION], [0, 0.32, 0.32, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      {/* golpes y transiciones */}
      <Sfx en={8} src="golpe" vol={0.55} />
      {[e.pagina, e.dia, e.cotiza, e.mapa, e.cierre].map((s) => <Sfx key={s.desde} en={inicio(s) - 2} src="whoosh" vol={0.5} />)}
      {/* etiquetas sobre el celular */}
      {[44, 58, 72].map((d) => <Sfx key={d} en={inicio(e.pagina) + d - 2} src="pop" vol={0.45} />)}
      {/* cada foto del día entra con un barrido corto */}
      {MOMENTOS.slice(1).map((_, i) => <Sfx key={i} en={inicio(e.dia) + (i + 1) * LARGO_MOMENTO - 3} src="whoosh-corto" vol={0.35} />)}
      {/* un tic por cada tercera persona que llega al prado */}
      {llegadas.filter((_, i) => i % 3 === 0).map((f, i) => <Sfx key={i} en={inicio(e.cotiza) + f - 1} src="tick" vol={0.3} />)}
      <Sfx en={inicio(e.cotiza) + LLEGA_CHAT + 8} src="mensaje" vol={0.6} />
      <Sfx en={inicio(e.mapa) + FIN_RUTA - 2} src="brillo" vol={0.45} />
      <Sfx en={inicio(e.cierre) + 2} src="golpe" vol={0.45} />
      <Sfx en={inicio(e.cierre) + BRILLO - 2} src="brillo" vol={0.5} />
    </AbsoluteFill>
  );
};
