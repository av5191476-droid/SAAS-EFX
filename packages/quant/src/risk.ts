/** VaR histórico: pérdida (positiva) que no se supera con probabilidad `confidence`. */
export function historicalVaR(returns: number[], confidence = 0.95): number {
  const clean = returns.filter(Number.isFinite).sort((a, b) => a - b);
  if (clean.length === 0) return 0;
  const idx = Math.max(0, Math.floor((1 - confidence) * clean.length) - 1);
  return Math.max(0, -clean[idx]!);
}

/** CVaR (Expected Shortfall): pérdida media en la cola más allá del VaR. */
export function conditionalVaR(returns: number[], confidence = 0.95): number {
  const clean = returns.filter(Number.isFinite).sort((a, b) => a - b);
  if (clean.length === 0) return 0;
  const n = Math.max(1, Math.floor((1 - confidence) * clean.length));
  const tail = clean.slice(0, n);
  return Math.max(0, -tail.reduce((a, b) => a + b, 0) / n);
}

/** Fracción de Kelly para un activo: mu / sigma². Se recorta a [-cap, cap]. */
export function kellyFraction(mean: number, variance: number, cap = 1): number {
  if (variance <= 0) return 0;
  return Math.max(-cap, Math.min(cap, mean / variance));
}

/** Peso para alcanzar una volatilidad objetivo anual dada la volatilidad realizada. */
export function volTargetWeight(realizedVol: number, targetVol: number, maxLeverage = 1): number {
  if (!(realizedVol > 0)) return 0;
  return Math.min(maxLeverage, targetVol / realizedVol);
}
