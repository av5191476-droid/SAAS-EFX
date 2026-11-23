import { computeMetrics, drawdownSeries } from "./metrics";
import type { BacktestConfig, BacktestResult, Bar, Signal, Trade } from "./types";

export const DEFAULT_CONFIG: BacktestConfig = {
  initialCapital: 1_000_000,
  feeBps: 1,
  slippageBps: 2,
  periodsPerYear: 252,
};

/**
 * Backtest vectorizado de un solo activo.
 * La señal calculada al cierre de la barra i se ejecuta en la barra i+1
 * (sin sesgo de anticipación). Costes = (comisión + slippage) × |Δposición|.
 */
export function runBacktest(
  bars: Bar[],
  signal: Signal,
  config: Partial<BacktestConfig> = {},
): BacktestResult {
  if (bars.length !== signal.length) {
    throw new Error(`Longitud de señal (${signal.length}) distinta a barras (${bars.length})`);
  }
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const costRate = (cfg.feeBps + cfg.slippageBps) / 10_000;
  const n = bars.length;
  const positions = new Array<number>(n).fill(0);
  const returns = new Array<number>(n).fill(0);
  const equityVals = new Array<number>(n).fill(cfg.initialCapital);
  const trades: Trade[] = [];

  for (let i = 1; i < n; i++) {
    const raw = signal[i - 1];
    const target = Number.isFinite(raw) ? Math.max(-1, Math.min(1, raw!)) : 0;
    const prevPos = positions[i - 1]!;
    const delta = target - prevPos;
    const assetRet = bars[i]!.close / bars[i - 1]!.close - 1;
    const cost = Math.abs(delta) * costRate;
    positions[i] = target;
    returns[i] = target * assetRet - cost;
    equityVals[i] = equityVals[i - 1]! * (1 + returns[i]!);
    if (Math.abs(delta) > 1e-9) {
      trades.push({
        t: bars[i - 1]!.t,
        side: delta > 0 ? "BUY" : "SELL",
        price: bars[i - 1]!.close,
        size: Math.abs(delta),
        cost: cost * equityVals[i - 1]!,
      });
    }
  }

  const base = bars[0]!.close;
  const dd = drawdownSeries(equityVals);
  return {
    equity: bars.map((b, i) => ({ t: b.t, value: equityVals[i]! })),
    benchmark: bars.map((b) => ({ t: b.t, value: (cfg.initialCapital * b.close) / base })),
    drawdown: bars.map((b, i) => ({ t: b.t, value: dd[i]! })),
    positions,
    returns,
    trades,
    metrics: computeMetrics(equityVals, returns, positions, trades.length, cfg.periodsPerYear),
  };
}
