/** Barra OHLCV. `t` es un timestamp Unix en milisegundos. */
export interface Bar {
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Posición objetivo por barra en el rango [-1, 1] (fracción del capital). */
export type Signal = number[];

export interface Trade {
  t: number;
  side: "BUY" | "SELL";
  price: number;
  /** Cambio de exposición, en fracción del capital. */
  size: number;
  cost: number;
}

export interface BacktestConfig {
  initialCapital: number;
  /** Comisión en puntos básicos sobre el nocional negociado. */
  feeBps: number;
  /** Deslizamiento en puntos básicos sobre el nocional negociado. */
  slippageBps: number;
  /** Barras por año, para anualizar (252 en diario). */
  periodsPerYear: number;
}

export interface Metrics {
  totalReturn: number;
  cagr: number;
  volatility: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  calmar: number;
  winRate: number;
  profitFactor: number;
  exposure: number;
  trades: number;
  var95: number;
  cvar95: number;
}

export interface BacktestResult {
  equity: { t: number; value: number }[];
  benchmark: { t: number; value: number }[];
  drawdown: { t: number; value: number }[];
  positions: number[];
  returns: number[];
  trades: Trade[];
  metrics: Metrics;
}
