"use client";

import { useMemo, useState } from "react";
import { STRATEGIES, generateBars, resolveParams, runBacktest } from "@efx/quant";
import { cn, formatNum, formatPct } from "@efx/ui";
import { EquityChart } from "~/components/charts/equity-chart";
import { Metric, toneOf } from "~/components/metric";

const BARS = generateBars({ seed: 2312, bars: 756 });

export function EngineDemo({ hint }: { hint: string }) {
  const [active, setActive] = useState(STRATEGIES[0]!.id);
  const result = useMemo(() => {
    const def = STRATEGIES.find((s) => s.id === active) ?? STRATEGIES[0]!;
    const res = runBacktest(BARS, def.signal(BARS, resolveParams(def)), { initialCapital: 1_000_000 });
    return {
      def,
      metrics: res.metrics,
      data: res.equity.map((p, i) => ({ t: p.t, strategy: p.value, benchmark: res.benchmark[i]!.value })),
    };
  }, [active]);

  const m = result.metrics;
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap gap-2 border-b border-border p-4" role="tablist" aria-label="Estrategias">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === active}
            onClick={() => setActive(s.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              s.id === active
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="p-4 md:p-6">
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          {result.def.description} <span className="text-foreground/70">{hint}</span>
        </p>
        <EquityChart data={result.data} strategyLabel={result.def.name} />
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-3 lg:grid-cols-6">
          <Metric label="CAGR" value={formatPct(m.cagr)} tone={toneOf(m.cagr)} />
          <Metric label="Sharpe" value={formatNum(m.sharpe)} />
          <Metric label="Sortino" value={formatNum(m.sortino)} />
          <Metric label="Drawdown máx." value={formatPct(m.maxDrawdown)} tone="negative" />
          <Metric label="VaR 95 % diario" value={formatPct(m.var95)} />
          <Metric label="Operaciones" value={String(m.trades)} />
        </div>
      </div>
    </div>
  );
}
