"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatUsd } from "@efx/ui";

export interface EquityPoint {
  t: number;
  strategy: number;
  benchmark?: number;
}

const month = new Intl.DateTimeFormat("es-ES", { month: "short", year: "2-digit" });
const day = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export function EquityChart({
  data,
  height = 320,
  valueFormatter = formatUsd,
  strategyLabel = "Estrategia",
}: {
  data: EquityPoint[];
  height?: number;
  valueFormatter?: (v: number) => string;
  strategyLabel?: string;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgb(var(--rule))" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => month.format(new Date(v))}
            stroke="rgb(var(--muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={48}
          />
          <YAxis
            tickFormatter={(v) => valueFormatter(Number(v))}
            stroke="rgb(var(--muted))"
            fontSize={12}
            width={88}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            labelFormatter={(v) => day.format(new Date(Number(v)))}
            formatter={(v, name) => [valueFormatter(Number(v)), name === "strategy" ? strategyLabel : "Comprar y mantener"]}
            contentStyle={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--rule))",
              borderRadius: 6,
              color: "rgb(var(--ink))",
            }}
          />
          <Line type="monotone" dataKey="benchmark" stroke="rgb(var(--bench))" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="strategy" stroke="rgb(var(--signal))" strokeWidth={2.25} dot={false} animationDuration={900} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
