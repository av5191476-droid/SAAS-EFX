import { Badge, Card, CardContent, formatPct } from "@efx/ui";
import { serverApi } from "~/trpc/server";

export const metadata = { title: "Estrategias" };

const label = { LIVE: "En vivo", PAPER: "Papel", RESEARCH: "Investigación", RETIRED: "Retirada" } as const;
const tone = { LIVE: "positive", PAPER: "accent", RESEARCH: "neutral", RETIRED: "negative" } as const;

export default async function StrategiesPage() {
  const api = await serverApi();
  const [catalog, overview] = await Promise.all([api.strategy.catalog(), api.fund.overview()]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Estrategias</h1>
        <p className="text-muted-foreground">Cartera actual del fondo y familias disponibles en el motor.</p>
      </div>
      <Card>
        <CardContent className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 font-normal">Estrategia</th>
                <th className="py-2 font-normal">Mercado</th>
                <th className="py-2 font-normal">Estado</th>
                <th className="py-2 text-right font-normal">Peso</th>
              </tr>
            </thead>
            <tbody>
              {overview.strategies.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3">{s.symbol}</td>
                  <td className="py-3">
                    <Badge tone={tone[s.status]}>{label[s.status]}</Badge>
                  </td>
                  <td className="py-3 text-right">{formatPct(s.weight)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {catalog.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-col gap-2 p-5">
              <span className="text-sm text-signal">{s.family}</span>
              <h2 className="font-display text-xl font-semibold">{s.name}</h2>
              <p className="text-sm text-muted-foreground">{s.description}</p>
              <p className="text-xs text-muted-foreground">
                Parámetros: {s.params.map((p) => `${p.label} (${p.default})`).join(", ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
