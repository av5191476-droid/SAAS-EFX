"use client";

import { Button } from "@efx/ui";
import { api } from "~/trpc/react";

export function UpgradeButton({
  plan,
  lang,
  current,
}: {
  plan: "ANALYST" | "PRO" | "INSTITUTIONAL";
  lang: string;
  current: boolean;
}) {
  const checkout = api.billing.checkout.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={current ? "outline" : "default"}
        disabled={checkout.isPending}
        onClick={() => checkout.mutate({ plan, lang })}
      >
        {current ? "Gestionar suscripción" : checkout.isPending ? "Redirigiendo…" : "Mejorar a este plan"}
      </Button>
      {checkout.error && <p className="text-xs text-negative">{checkout.error.message}</p>}
    </div>
  );
}
