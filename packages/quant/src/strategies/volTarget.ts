import { ema, pctReturns, rollingStd } from "../indicators";
import { volTargetWeight } from "../risk";
import type { StrategyDefinition } from "./types";

export const volTargetTrend: StrategyDefinition = {
  id: "vol-target-trend",
  name: "Tendencia con objetivo de volatilidad",
  family: "Volatilidad",
  description: "Dirección por EMA y tamaño escalado para mantener una volatilidad anual objetivo.",
  params: [
    { key: "ema", label: "EMA de tendencia", min: 20, max: 250, step: 5, default: 60 },
    { key: "volWindow", label: "Ventana de volatilidad", min: 10, max: 120, step: 1, default: 20 },
    { key: "target", label: "Volatilidad objetivo (%)", min: 5, max: 40, step: 1, default: 12 },
    { key: "band", label: "Banda de rebalanceo (%)", min: 0, max: 50, step: 1, default: 15 },
  ],
  signal: (bars, p) => {
    const closes = bars.map((b) => b.close);
    const trend = ema(closes, p.ema!);
    const sd = rollingStd(pctReturns(closes), p.volWindow!);
    let held = 0;
    return closes.map((c, i) => {
      if (!Number.isFinite(trend[i]) || !Number.isFinite(sd[i])) return 0;
      const dir = c > trend[i]! ? 1 : 0;
      const ideal = dir * volTargetWeight(sd[i]! * Math.sqrt(252), p.target! / 100, 1);
      // Solo rebalancea si la desviación supera la banda o cambia la dirección.
      if (ideal === 0 || held === 0 || Math.abs(ideal - held) > p.band! / 100) held = ideal;
      return held;
    });
  },
};
