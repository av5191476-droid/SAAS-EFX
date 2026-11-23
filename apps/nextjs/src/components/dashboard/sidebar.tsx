"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, FlaskConical, LayoutDashboard, Layers } from "lucide-react";
import { cn } from "@efx/ui";

export function Sidebar({
  lang,
  labels,
}: {
  lang: string;
  labels: { overview: string; backtest: string; strategies: string; billing: string };
}) {
  const pathname = usePathname();
  const items = [
    { href: `/${lang}/dashboard`, label: labels.overview, icon: LayoutDashboard },
    { href: `/${lang}/dashboard/backtest`, label: labels.backtest, icon: FlaskConical },
    { href: `/${lang}/dashboard/strategies`, label: labels.strategies, icon: Layers },
    { href: `/${lang}/dashboard/billing`, label: labels.billing, icon: CreditCard },
  ];
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm",
              active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon aria-hidden className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
