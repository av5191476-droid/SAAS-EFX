import { Card, CardContent, CardDescription, CardHeader, CardTitle, formatUsd } from "@efx/ui";
import { serverApi } from "~/trpc/server";
import { UpgradeButton } from "~/components/dashboard/upgrade-button";

export const metadata = { title: "Plan y facturación" };

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { lang } = await params;
  const { status } = await searchParams;
  const api = await serverApi();
  const [plans, current] = await Promise.all([api.billing.plans(), api.billing.current()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Plan y facturación</h1>
        <p className="text-muted-foreground">
          Tu plan es <span className="text-foreground">{current.plan.name}</span>
          {current.periodEnd && ` y se renueva el ${new Date(current.periodEnd).toLocaleDateString("es-ES")}`}.
        </p>
      </div>
      {status === "success" && (
        <p className="rounded-md border border-positive/40 bg-positive/10 px-4 py-3 text-sm">
          Pago confirmado. Tu plan se actualizará en unos segundos.
        </p>
      )}
      {status === "cancel" && (
        <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm">
          Pago cancelado. No se ha realizado ningún cargo.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === current.plan.id ? "border-foreground" : undefined}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="font-display text-3xl font-semibold">
                {formatUsd(plan.priceMonthly)}
                <span className="text-base font-normal text-muted-foreground">/mes</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {plan.limits.backtestsPerDay.toLocaleString("es-ES")} backtests al día,{" "}
                {plan.limits.liveSignals ? "con señales en vivo" : "sin señales en vivo"}
              </p>
              {plan.id !== "FREE" && (
                <UpgradeButton plan={plan.id} lang={lang} current={plan.id === current.plan.id} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
