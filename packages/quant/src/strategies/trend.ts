import { sma } from "../indicators";
import type { StrategyDefinition } from "./types";

export const smaCrossover: StrategyDefinition = {
  id: "sma-crossover",
  name: "Cruce de medias",
  family: "Tendencia",
  description: "Largo cuando la media rápida supera a la lenta; plano o corto en caso contrario.",
  params: [
    { key: "fast", label: "Media rápida", min: 5, max: 100, step: 1, default: 20 },
    { key: "slow", label: "Media lenta", min: 20, max: 300, step: 5, default: 100 },
    { key: "allowShort", label: "Permitir cortos (0/1)", min: 0, max: 1, step: 1, default: 0 },
  ],
  signal: (bars, p) => {
    const closes = bars.map((b) => b.close);
    const fast = sma(closes, p.fast!);
    const slow = sma(closes, p.slow!);
    return closes.map((_, i) => {
      if (!Number.isFinite(fast[i]) || !Number.isFinite(slow[i])) return 0;
      if (fast[i]! > slow[i]!) return 1;
      return p.allowShort ? -1 : 0;
    });
  },
};
