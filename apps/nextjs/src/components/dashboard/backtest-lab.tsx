"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, formatNum, formatPct, formatUsd } from "@efx/ui";
import { api } from "~/trpc/react";
import { EquityChart } from "~/components/charts/equity-chart";
import { DrawdownChart } from "~/components/charts/drawdown-chart";
import { Metric, toneOf } from "~/components/metric";

interface Slider {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

function Range({ label, min, max, step, value, onChange, format }: Omit<Slider, "key">) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="flex justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-[rgb(var(--signal))]"
      />
    </label>
  );
}

export function BacktestLab() {
  const catalog = api.strategy.catalog.useQuery();
  const run = api.backtest.run.useMutation();
  const utils = api.useUtils();

  const [engineId, setEngineId] = useState("");
  const [params, setParams] = useState<Record<string, number>>({});
  const [seed, setSeed] = useState(42);
  const [sigma, setSigma] = useState(0.2);
  const [mu, setMu] = useState(0.08);
  const [feeBps, setFeeBps] = useState(1);
  const [slippageBps, setSlippageBps] = useState(2);

  const def = catalog.data?.find((s) => s.id === engineId);

  useEffect(() => {
    const first = catalog.data?.[0];
    if (first && !engineId) {
      setEngineId(first.id);
      setParams(Object.fromEntries(first.params.map((p) => [p.key, p.default])));
    }
  }, [catalog.data, engineId]);

  function selectStrategy(id: string) {
    const next = catalog.data?.find((s) => s.id === id);
    setEngineId(id);
    setParams(next ? Object.fromEntries(next.params.map((p) => [p.key, p.default])) : {});
  }

  function execute() {
    run.mutate(
      { engineId, params, market: { seed, bars: 756, mu, sigma }, costs: { feeBps, slippageBps, initialCapital: 1_000_000 } },
      { onSuccess: () => void utils.backtest.history.invalidate() },
    );
  }

  const r = run.data;
  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Estrategia</span>
            <select
              value={engineId}
              onChange={(e) => selectStrategy(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3"
            >
              {catalog.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {def?.params.map((p) => (
            <Range
              key={p.key}
              label={p.label}
              min={p.min}
              max={p.max}
              step={p.step}
              value={params[p.key] ?? p.default}
              onChange={(v) => setParams((prev) => ({ ...prev, [p.key]: v }))}
            />
          ))}
          <hr className="border-border" />
          <Range label="Semilla del mercado" min={1} max={999} step={1} value={seed} onChange={setSeed} />
          <Range label="Deriva anual" min={-0.2} max={0.3} step={0.01} value={mu} onChange={setMu} format={formatPct} />
          <Range label="Volatilidad anual" min={0.05} max={0.6} step={0.01} value={sigma} onChange={setSigma} format={formatPct} />
          <Range label="Comisión (pb)" min={0} max={20} step={0.5} value={feeBps} onChange={setFeeBps} />
          <Range label="Deslizamiento (pb)" min={0} max={20} step={0.5} value={slippageBps} onChange={setSlippageBps} />
          <Button onClick={execute} disabled={!engineId || run.isPending}>
            {run.isPending ? "Calculando…" : "Ejecutar backtest"}
          </Button>
          {run.error && <p className="text-sm text-negative">{run.error.message}</p>}
          {r && (
            <p className="text-xs text-muted-foreground">
              Backtests de hoy: {r.usage.used} de {r.usage.limit}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-6">
        {!r ? (
          <Card>
            <CardContent className="grid min-h-[360px] place-items-center p-10 text-center text-muted-foreground">
              Ajusta los parámetros y ejecuta un backtest para ver la curva de capital, el drawdown y las operaciones.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-5">
                <EquityChart
                  data={r.equity.map((p, i) => ({ t: p.t, strategy: p.value, benchmark: r.benchmark[i]?.value }))}
                  strategyLabel={def?.name}
                />
                <DrawdownChart data={r.drawdown} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-4">
                <Metric label="Rentab. total" value={formatPct(r.metrics.totalReturn)} tone={toneOf(r.metrics.totalReturn)} />
                <Metric label="CAGR" value={formatPct(r.metrics.cagr)} tone={toneOf(r.metrics.cagr)} />
                <Metric label="Volatilidad" value={formatPct(r.metrics.volatility)} />
                <Metric label="Sharpe" value={formatNum(r.metrics.sharpe)} />
                <Metric label="Sortino" value={formatNum(r.metrics.sortino)} />
                <Metric label="Calmar" value={formatNum(r.metrics.calmar)} />
                <Metric label="Drawdown máx." value={formatPct(r.metrics.maxDrawdown)} tone="negative" />
                <Metric label="CVaR 95 %" value={formatPct(r.metrics.cvar95)} />
                <Metric label="Acierto" value={formatPct(r.metrics.winRate)} />
                <Metric label="Profit factor" value={formatNum(r.metrics.profitFactor)} />
                <Metric label="Exposición" value={formatPct(r.metrics.exposure)} />
                <Metric label="Operaciones" value={String(r.metrics.trades)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Últimas operaciones</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 font-normal">Fecha</th>
                      <th className="py-2 font-normal">Lado</th>
                      <th className="py-2 text-right font-normal">Precio</th>
                      <th className="py-2 text-right font-normal">Tamaño</th>
                      <th className="py-2 text-right font-normal">Coste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.trades.map((tr, i) => (
                      <tr key={`${tr.t}-${i}`} className="border-t border-border">
                        <td className="py-2">{new Date(tr.t).toLocaleDateString("es-ES")}</td>
                        <td className={tr.side === "BUY" ? "py-2 text-positive" : "py-2 text-negative"}>
                          {tr.side === "BUY" ? "Compra" : "Venta"}
                        </td>
                        <td className="py-2 text-right">{formatNum(tr.price)}</td>
                        <td className="py-2 text-right">{formatPct(tr.size)}</td>
                        <td className="py-2 text-right">{formatUsd(tr.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
