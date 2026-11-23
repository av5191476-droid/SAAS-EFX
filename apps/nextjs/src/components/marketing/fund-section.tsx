import { Badge, formatNum, formatPct, formatUsd } from "@efx/ui";
import type { RouterOutputs } from "@efx/api";
import { EquityChart } from "~/components/charts/equity-chart";
import { Metric, toneOf } from "~/components/metric";

type Overview = RouterOutputs["fund"]["overview"];
type Nav = RouterOutputs["fund"]["navHistory"];

const statusTone = { LIVE: "positive", PAPER: "accent", RESEARCH: "neutral", RETIRED: "negative" } as const;
const statusLabel = { LIVE: "En vivo", PAPER: "Papel", RESEARCH: "Investigación", RETIRED: "Retirada" } as const;

export function FundPanel({ overview, nav }: { overview: Overview; nav: Nav }) {
  const s = overview.stats;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">NAV por participación (base 100)</span>
          <span className="font-display text-3xl font-semibold">{formatNum(s.nav)}</span>
        </div>
        <EquityChart
          data={nav.map((p) => ({ t: p.t, strategy: p.nav }))}
          valueFormatter={formatNum}
          strategyLabel="NAV EFX"
          height={280}
        />
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-4">
          <Metric label="Rentab. del año" value={formatPct(s.ytd)} tone={toneOf(s.ytd)} />
          <Metric label="CAGR" value={formatPct(s.cagr)} tone={toneOf(s.cagr)} />
          <Metric label="Sharpe" value={formatNum(s.sharpe)} />
          <Metric label="Drawdown máx." value={formatPct(s.maxDrawdown)} tone="negative" />
        </div>
      </div>
      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Patrimonio gestionado</p>
          <p className="font-display text-3xl font-semibold">{formatUsd(overview.aum)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Desde {new Date(overview.inception).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-sm text-muted-foreground">Asignación por estrategia</p>
          <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-muted">
            {overview.strategies.map((st, i) => (
              <span
                key={st.id}
                style={{ width: `${st.weight * 100}%`, opacity: 1 - i * 0.2 }}
                className="bg-signal"
              />
            ))}
          </div>
          <ul className="flex flex-col gap-3">
            {overview.strategies.map((st) => (
              <li key={st.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{st.name}</span>
                  <span className="text-muted-foreground">{st.symbol}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone={statusTone[st.status]}>{statusLabel[st.status]}</Badge>
                  <span className="w-12 text-right">{formatPct(st.weight)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
