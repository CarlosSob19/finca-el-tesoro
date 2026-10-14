// Única fuente de colores, fuentes, curvas y resortes del video. Nada de esto se escribe a mano en los componentes.
import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#1c1813", // tinta: la base cálida y oscura
    bgAlt: "#2a231b",
    primary: "#f4c531", // sol: el color protagonista, un solo elemento por cuadro
    accent: "#b8261c", // achiote
    river: "#134a73",
    pool: "#1fa8b8",
    leaf: "#2f7a35",
    text: "#f7f8f4", // cal
    textDim: "rgba(247, 248, 244, 0.72)",
    glow: "rgba(244, 197, 49, 0.45)",
    whatsapp: "#25d366",
    chatBg: "#efe7dd",
    chatBubble: "#d9fdd3",
    ink: "#1c1813",
  },
  fonts: {
    display: "Alfa Slab One",
    body: "Hanken Grotesk",
    hand: "Caveat",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
  // 100 BPM a 30 fps: un tiempo = 18 cuadros. Los cortes caen en tiempos.
  beat: 18,
} as const;
