import { zscore } from "../indicators";
import type { StrategyDefinition } from "./types";

export const zscoreReversion: StrategyDefinition = {
  id: "zscore-reversion",
  name: "Reversión por z-score",
  family: "Reversión",
  description: "Compra cuando el precio cae por debajo de −entrada desviaciones y cierra al volver a la media.",
  params: [
    { key: "lookback", label: "Ventana", min: 10, max: 120, step: 1, default: 30 },
    { key: "entry", label: "Umbral de entrada (σ)", min: 0.5, max: 3, step: 0.1, default: 1.5 },
    { key: "exit", label: "Umbral de salida (σ)", min: 0, max: 1.5, step: 0.1, default: 0.2 },
  ],
  signal: (bars, p) => {
    const z = zscore(bars.map((b) => b.close), p.lookback!);
    const out: number[] = [];
    let pos = 0;
    for (let i = 0; i < z.length; i++) {
      const v = z[i]!;
      if (!Number.isFinite(v)) {
        out.push(0);
        continue;
      }
      if (pos === 0 && v < -p.entry!) pos = 1;
      else if (pos === 0 && v > p.entry!) pos = -1;
      else if (pos === 1 && v > -p.exit!) pos = 0;
      else if (pos === -1 && v < p.exit!) pos = 0;
      out.push(pos);
    }
    return out;
  },
};
