import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const pct = new Intl.NumberFormat("es-ES", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export const formatPct = (v: number) => (Number.isFinite(v) ? pct.format(v) : "—");
export const formatUsd = (v: number) => (Number.isFinite(v) ? usd.format(v) : "—");
export const formatNum = (v: number) => (Number.isFinite(v) ? num.format(v) : "∞");
