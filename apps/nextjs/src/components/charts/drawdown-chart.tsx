"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatPct } from "@efx/ui";

export function DrawdownChart({ data, height = 120 }: { data: { t: number; value: number }[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
          <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} hide />
          <YAxis
            tickFormatter={(v) => formatPct(Number(v))}
            stroke="rgb(var(--muted))"
            fontSize={12}
            width={88}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            labelFormatter={(v) => new Date(Number(v)).toLocaleDateString("es-ES")}
            formatter={(v) => [formatPct(Number(v)), "Drawdown"]}
            contentStyle={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--rule))", borderRadius: 6 }}
          />
          <Area type="monotone" dataKey="value" stroke="rgb(var(--negative))" fill="rgb(var(--negative) / 0.18)" strokeWidth={1.5} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
