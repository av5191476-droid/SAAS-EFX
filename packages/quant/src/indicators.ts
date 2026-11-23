/** Indicadores técnicos. Los valores de calentamiento se devuelven como NaN. */

export function sma(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(Number.NaN);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i]!;
    if (i >= period) sum -= values[i - period]!;
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function ema(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(Number.NaN);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < period; i++) prev += values[i]!;
  prev /= period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i]! * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function rollingStd(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(Number.NaN);
  for (let i = period - 1; i < values.length; i++) {
    let mean = 0;
    for (let j = i - period + 1; j <= i; j++) mean += values[j]!;
    mean /= period;
    let v = 0;
    for (let j = i - period + 1; j <= i; j++) v += (values[j]! - mean) ** 2;
    out[i] = Math.sqrt(v / (period - 1));
  }
  return out;
}

export function pctReturns(values: number[]): number[] {
  const out = new Array<number>(values.length).fill(0);
  for (let i = 1; i < values.length; i++) out[i] = values[i]! / values[i - 1]! - 1;
  return out;
}

export function zscore(values: number[], period: number): number[] {
  const mean = sma(values, period);
  const sd = rollingStd(values, period);
  return values.map((v, i) => (sd[i]! > 0 ? (v - mean[i]!) / sd[i]! : Number.NaN));
}

/** RSI de Wilder. */
export function rsi(values: number[], period = 14): number[] {
  const out = new Array<number>(values.length).fill(Number.NaN);
  if (values.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i]! - values[i - 1]!;
    if (d >= 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i]! - values[i - 1]!;
    gain = (gain * (period - 1) + Math.max(d, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

export function bollinger(values: number[], period = 20, mult = 2) {
  const mid = sma(values, period);
  const sd = rollingStd(values, period);
  return {
    mid,
    upper: mid.map((m, i) => m + mult * sd[i]!),
    lower: mid.map((m, i) => m - mult * sd[i]!),
  };
}
