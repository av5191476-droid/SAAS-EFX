import { conditionalVaR, historicalVaR } from "./risk";
import type { Metrics } from "./types";

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

export function drawdownSeries(equity: number[]): number[] {
  let peak = -Infinity;
  return equity.map((v) => {
    peak = Math.max(peak, v);
    return peak > 0 ? v / peak - 1 : 0;
  });
}

export function computeMetrics(
  equity: number[],
  returns: number[],
  positions: number[],
  tradeCount: number,
  periodsPerYear = 252,
  riskFree = 0,
): Metrics {
  const r = returns.slice(1);
  const first = equity[0] ?? 1;
  const last = equity[equity.length - 1] ?? first;
  const years = Math.max(r.length / periodsPerYear, 1 / periodsPerYear);
  const totalReturn = last / first - 1;
  const cagr = last > 0 ? (last / first) ** (1 / years) - 1 : -1;
  const vol = stdev(r) * Math.sqrt(periodsPerYear);
  const rfPer = riskFree / periodsPerYear;
  const excess = r.map((x) => x - rfPer);
  const sharpe = vol > 0 ? (mean(excess) * periodsPerYear) / vol : 0;
  const downside = Math.sqrt(mean(r.map((x) => Math.min(0, x) ** 2))) * Math.sqrt(periodsPerYear);
  const sortino = downside > 0 ? (mean(excess) * periodsPerYear) / downside : 0;
  const maxDrawdown = Math.min(0, ...drawdownSeries(equity));
  const calmar = maxDrawdown < 0 ? cagr / Math.abs(maxDrawdown) : 0;
  const active = r.filter((_, i) => Math.abs(positions[i] ?? 0) > 1e-9);
  const wins = active.filter((x) => x > 0);
  const losses = active.filter((x) => x < 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const grossWin = wins.reduce((a, b) => a + b, 0);
  return {
    totalReturn,
    cagr,
    volatility: vol,
    sharpe,
    sortino,
    maxDrawdown,
    calmar,
    winRate: active.length ? wins.length / active.length : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
    exposure: positions.length ? positions.filter((p) => Math.abs(p) > 1e-9).length / positions.length : 0,
    trades: tradeCount,
    var95: historicalVaR(r, 0.95),
    cvar95: conditionalVaR(r, 0.95),
  };
}
