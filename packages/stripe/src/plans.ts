import type { Plan } from "@efx/db";

export interface PlanInfo {
  id: Plan;
  name: string;
  priceMonthly: number;
  priceId?: string;
  description: string;
  features: string[];
  limits: { backtestsPerDay: number; strategies: number; liveSignals: boolean };
}

export const PLANS: PlanInfo[] = [
  {
    id: "FREE",
    name: "Explorador",
    priceMonthly: 0,
    description: "Para conocer el motor y el rendimiento del fondo.",
    features: ["Panel de NAV del fondo", "5 backtests al día", "2 estrategias guardadas"],
    limits: { backtestsPerDay: 5, strategies: 2, liveSignals: false },
  },
  {
    id: "ANALYST",
    name: "Analista",
    priceMonthly: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ANALYST_PRICE_ID,
    description: "Investigación cuantitativa sin límites prácticos.",
    features: ["100 backtests al día", "20 estrategias", "Exportación de resultados", "Métricas de riesgo VaR/CVaR"],
    limits: { backtestsPerDay: 100, strategies: 20, liveSignals: false },
  },
  {
    id: "PRO",
    name: "Pro",
    priceMonthly: 199,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    description: "Señales del fondo en tiempo real y estrategias en papel.",
    features: ["Backtests ilimitados", "Señales en vivo", "Paper trading", "API de solo lectura"],
    limits: { backtestsPerDay: 10_000, strategies: 100, liveSignals: true },
  },
  {
    id: "INSTITUTIONAL",
    name: "Institucional",
    priceMonthly: 990,
    priceId: process.env.NEXT_PUBLIC_STRIPE_INSTITUTIONAL_PRICE_ID,
    description: "Para family offices y gestores que replican la cartera.",
    features: ["Todo lo de Pro", "Cuentas gestionadas", "Informes mensuales auditados", "Soporte dedicado"],
    limits: { backtestsPerDay: 100_000, strategies: 1000, liveSignals: true },
  },
];

export function planFromPriceId(priceId: string | null | undefined): Plan {
  return PLANS.find((p) => p.priceId && p.priceId === priceId)?.id ?? "FREE";
}

export function getPlan(id: Plan): PlanInfo {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]!;
}
