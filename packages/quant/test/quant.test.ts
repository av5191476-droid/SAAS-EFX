import { describe, expect, test } from "bun:test";
import {
  STRATEGIES,
  conditionalVaR,
  ema,
  generateBars,
  historicalVaR,
  resolveParams,
  rsi,
  runBacktest,
  sma,
} from "../src";

describe("datos sintéticos", () => {
  test("son deterministas por semilla", () => {
    expect(generateBars({ seed: 7, bars: 50 })).toEqual(generateBars({ seed: 7, bars: 50 }));
  });
  test("OHLC coherente", () => {
    for (const b of generateBars({ bars: 300 })) {
      expect(b.high).toBeGreaterThanOrEqual(Math.max(b.open, b.close));
      expect(b.low).toBeLessThanOrEqual(Math.min(b.open, b.close));
    }
  });
});

describe("indicadores", () => {
  test("SMA", () => {
    expect(sma([1, 2, 3, 4, 5], 3).slice(2)).toEqual([2, 3, 4]);
  });
  test("EMA arranca en la SMA", () => {
    expect(ema([2, 4, 6, 8], 2)[1]).toBe(3);
  });
  test("RSI en [0, 100]", () => {
    const r = rsi(generateBars().map((b) => b.close)).filter(Number.isFinite);
    expect(r.every((v) => v >= 0 && v <= 100)).toBe(true);
  });
});

describe("riesgo", () => {
  test("CVaR >= VaR", () => {
    const rets = generateBars({ bars: 1000 }).map((b, i, a) => (i ? b.close / a[i - 1]!.close - 1 : 0));
    expect(conditionalVaR(rets)).toBeGreaterThanOrEqual(historicalVaR(rets));
  });
});

describe("backtest", () => {
  const bars = generateBars({ bars: 600 });
  test("señal plana conserva el capital", () => {
    const res = runBacktest(bars, bars.map(() => 0));
    expect(res.equity.at(-1)!.value).toBe(1_000_000);
    expect(res.trades.length).toBe(0);
  });
  test("comprar y mantener sin costes replica el benchmark", () => {
    const res = runBacktest(bars, bars.map(() => 1), { feeBps: 0, slippageBps: 0 });
    const ratio = res.equity.at(-1)!.value / res.benchmark.at(-1)!.value;
    expect(ratio).toBeCloseTo(1, 6);
  });
  test("todas las estrategias producen métricas finitas", () => {
    for (const s of STRATEGIES) {
      const res = runBacktest(bars, s.signal(bars, resolveParams(s)));
      expect(Number.isFinite(res.metrics.sharpe)).toBe(true);
      expect(res.metrics.maxDrawdown).toBeLessThanOrEqual(0);
    }
  });
});
