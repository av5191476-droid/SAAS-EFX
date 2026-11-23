import type { Bar } from "./types";

/** PRNG determinista (mulberry32): mismos resultados con la misma semilla. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal estándar por Box-Muller. */
export function gaussian(rand: () => number): number {
  let u = 0;
  while (u === 0) u = rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface SyntheticOptions {
  seed?: number;
  bars?: number;
  start?: number;
  /** Deriva anual. */
  mu?: number;
  /** Volatilidad anual. */
  sigma?: number;
  /** Persistencia de régimen de volatilidad [0,1). */
  regime?: number;
  startTime?: number;
}

/**
 * Serie sintética con movimiento browniano geométrico y volatilidad por regímenes,
 * útil para demos y tests reproducibles sin depender de un proveedor de datos.
 */
export function generateBars(opts: SyntheticOptions = {}): Bar[] {
  const {
    seed = 42,
    bars = 756,
    start = 100,
    mu = 0.08,
    sigma = 0.2,
    regime = 0.97,
    startTime = Date.UTC(2023, 0, 2),
  } = opts;
  const rand = mulberry32(seed);
  const dt = 1 / 252;
  const out: Bar[] = [];
  let price = start;
  let volState = 1;
  for (let i = 0; i < bars; i++) {
    volState = regime * volState + (1 - regime) * (0.6 + rand() * 1.2);
    const vol = sigma * volState;
    const ret = (mu - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * gaussian(rand);
    const open = price;
    const close = open * Math.exp(ret);
    const span = Math.abs(close - open) + open * vol * Math.sqrt(dt) * rand();
    const high = Math.max(open, close) + span * rand() * 0.5;
    const low = Math.min(open, close) - span * rand() * 0.5;
    out.push({
      t: startTime + i * 86_400_000,
      open,
      high,
      low: Math.max(low, 0.01),
      close,
      volume: Math.round(1_000_000 * (0.5 + rand()) * volState),
    });
    price = close;
  }
  return out;
}
