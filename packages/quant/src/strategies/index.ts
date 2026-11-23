import { zscoreReversion } from "./meanReversion";
import { rsiMomentum } from "./momentum";
import { smaCrossover } from "./trend";
import type { StrategyDefinition } from "./types";
import { volTargetTrend } from "./volTarget";

export * from "./types";
export { smaCrossover, zscoreReversion, rsiMomentum, volTargetTrend };

export const STRATEGIES: StrategyDefinition[] = [smaCrossover, zscoreReversion, rsiMomentum, volTargetTrend];

export function getStrategy(id: string): StrategyDefinition {
  const s = STRATEGIES.find((x) => x.id === id);
  if (!s) throw new Error(`Estrategia desconocida: ${id}`);
  return s;
}
