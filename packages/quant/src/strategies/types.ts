import type { Bar, Signal } from "../types";

export interface ParamSpec {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  family: "Tendencia" | "Reversión" | "Momentum" | "Volatilidad";
  description: string;
  params: ParamSpec[];
  signal: (bars: Bar[], params: Record<string, number>) => Signal;
}

export function resolveParams(def: StrategyDefinition, input: Record<string, number> = {}) {
  const out: Record<string, number> = {};
  for (const p of def.params) {
    const v = input[p.key];
    out[p.key] = typeof v === "number" && Number.isFinite(v) ? Math.min(p.max, Math.max(p.min, v)) : p.default;
  }
  return out;
}
