import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@efx/stripe";
import { Button, cn, formatUsd } from "@efx/ui";

export function Pricing({ lang, cta, perMonth }: { lang: string; cta: string; perMonth: string }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((plan) => {
        const featured = plan.id === "PRO";
        return (
          <div key={plan.id} className={cn("flex flex-col gap-5 bg-card p-6", featured && "bg-foreground text-background")}>
            <div>
              <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
              <p className={cn("mt-1 text-sm", featured ? "text-background/70" : "text-muted-foreground")}>
                {plan.description}
              </p>
            </div>
            <p>
              <span className="font-display text-4xl font-semibold">{formatUsd(plan.priceMonthly)}</span>
              <span className={featured ? "text-background/70" : "text-muted-foreground"}>{perMonth}</span>
            </p>
            <ul className="flex flex-1 flex-col gap-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant={featured ? "secondary" : "outline"}>
              <Link href={`/${lang}/dashboard/billing`}>{cta}</Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
