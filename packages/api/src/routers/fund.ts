import { z } from "zod";
import { STRATEGIES, computeMetrics, generateBars, resolveParams, runBacktest } from "@efx/quant";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface NavPoint {
  t: number;
  nav: number;
}

const WEIGHTS = [0.35, 0.15, 0.25, 0.25];

/** NAV de demostración si la base de datos aún no tiene datos sembrados. */
function syntheticNav(): NavPoint[] {
  const bars = generateBars({ seed: 2312, bars: 756 });
  const curves = STRATEGIES.map((s) => runBacktest(bars, s.signal(bars, resolveParams(s)), { initialCapital: 100 }));
  return bars.map((b, i) => ({
    t: b.t,
    nav: curves.reduce((acc, c, k) => acc + (WEIGHTS[k] ?? 0) * c.equity[i]!.value, 0),
  }));
}

function summarize(points: NavPoint[]) {
  const navs = points.map((p) => p.nav);
  const rets = navs.map((v, i) => (i ? v / navs[i - 1]! - 1 : 0));
  const m = computeMetrics(navs, rets, navs.map(() => 1), 0);
  const last = points[points.length - 1];
  const yearStart = points.find((p) => new Date(p.t).getUTCFullYear() === new Date(last?.t ?? 0).getUTCFullYear());
  const monthAgo = points[Math.max(0, points.length - 22)];
  return {
    nav: last?.nav ?? 100,
    ytd: last && yearStart ? last.nav / yearStart.nav - 1 : 0,
    mtd: last && monthAgo ? last.nav / monthAgo.nav - 1 : 0,
    cagr: m.cagr,
    sharpe: m.sharpe,
    sortino: m.sortino,
    volatility: m.volatility,
    maxDrawdown: m.maxDrawdown,
    var95: m.var95,
  };
}

export const fundRouter = createTRPCRouter({
  overview: publicProcedure.query(async ({ ctx }) => {
    try {
      const fund = await ctx.db.fund.findFirst({
        include: {
          strategies: { orderBy: { weight: "desc" } },
          snapshots: { orderBy: { date: "asc" } },
        },
      });
      if (fund && fund.snapshots.length > 1) {
        const points = fund.snapshots.map((s) => ({ t: s.date.getTime(), nav: Number(s.nav) }));
        return {
          source: "database" as const,
          name: fund.name,
          aum: Number(fund.aum),
          inception: fund.inception.getTime(),
          stats: summarize(points),
          strategies: fund.strategies.map((s) => ({
            id: s.id,
            engineId: s.engineId,
            name: s.name,
            symbol: s.symbol,
            status: s.status,
            weight: s.weight,
          })),
        };
      }
    } catch (err) {
      console.warn("[fund.overview] usando datos de demostración:", (err as Error).message);
    }
    const points = syntheticNav();
    return {
      source: "demo" as const,
      name: "EFX Multi-Strategy",
      aum: 48_250_000,
      inception: points[0]!.t,
      stats: summarize(points),
      strategies: STRATEGIES.map((s, i) => ({
        id: `demo-${s.id}`,
        engineId: s.id,
        name: s.name,
        symbol: ["ES", "EURUSD", "NQ", "GC"][i] ?? "ES",
        status: i === 1 ? ("PAPER" as const) : ("LIVE" as const),
        weight: WEIGHTS[i] ?? 0,
      })),
    };
  }),

  navHistory: publicProcedure
    .input(z.object({ maxPoints: z.number().int().min(20).max(2000).default(260) }).optional())
    .query(async ({ ctx, input }) => {
      const maxPoints = input?.maxPoints ?? 260;
      let points: NavPoint[] = [];
      try {
        const rows = await ctx.db.navSnapshot.findMany({ orderBy: { date: "asc" } });
        points = rows.map((r) => ({ t: r.date.getTime(), nav: Number(r.nav) }));
      } catch {
        points = [];
      }
      if (points.length < 2) points = syntheticNav();
      const step = Math.max(1, Math.ceil(points.length / maxPoints));
      return points.filter((_, i) => i % step === 0 || i === points.length - 1);
    }),
});
