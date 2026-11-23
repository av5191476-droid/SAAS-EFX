import { rsi } from "../indicators";
import type { StrategyDefinition } from "./types";

export const rsiMomentum: StrategyDefinition = {
  id: "rsi-momentum",
  name: "Momentum RSI",
  family: "Momentum",
  description: "Entra largo cuando el RSI cruza al alza el umbral y sale al perder el nivel de salida.",
  params: [
    { key: "period", label: "Periodo RSI", min: 5, max: 30, step: 1, default: 14 },
    { key: "enter", label: "Nivel de entrada", min: 50, max: 80, step: 1, default: 55 },
    { key: "exitLevel", label: "Nivel de salida", min: 30, max: 55, step: 1, default: 45 },
  ],
  signal: (bars, p) => {
    const r = rsi(bars.map((b) => b.close), p.period!);
    let pos = 0;
    return r.map((v) => {
      if (!Number.isFinite(v)) return 0;
      if (pos === 0 && v > p.enter!) pos = 1;
      else if (pos === 1 && v < p.exitLevel!) pos = 0;
      return pos;
    });
  },
};
