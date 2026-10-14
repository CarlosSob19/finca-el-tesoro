// Carga las fuentes de la página (las mismas de la web) antes de pintar cualquier cuadro.
import { continueRender, delayRender, staticFile } from "remotion";

const fuentes: [string, string, string][] = [
  ["Alfa Slab One", "fonts/alfa-slab-one.woff2", "400"],
  ["Hanken Grotesk", "fonts/hanken-grotesk.woff2", "400 700"],
  ["Caveat", "fonts/caveat.woff2", "500 700"],
];

const espera = delayRender("Cargando fuentes");
Promise.all(
  fuentes.map(([nombre, ruta, peso]) => {
    const f = new FontFace(nombre, `url(${staticFile(ruta)}) format('woff2')`, { weight: peso });
    return f.load().then((cargada) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(cargada));
  }),
)
  .then(() => continueRender(espera))
  .catch((e) => {
    console.error(e);
    continueRender(espera);
  });
