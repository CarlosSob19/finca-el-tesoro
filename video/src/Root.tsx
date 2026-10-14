import React from "react";
import { Composition } from "remotion";
import "./fuentes";
import { DURACION, Promo } from "./Promo";

export const Root: React.FC = () => (
  <Composition id="Promo" component={Promo} durationInFrames={DURACION} fps={30} width={1080} height={1920} />
);
