import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateBars, getStrategy, resolveParams, runBacktest } from "@efx/quant";
import { getPlan } from "@efx/stripe";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const backtestInput = z.object({
  engineId: z.string().min(1),
  params: z.record(z.number()).default({}),
  market: z
    .object({
      seed: z.number().int().min(1).max(1_000_000).default(42),
      bars: z.number().int().min(120).max(2520).default(756),
      mu: z.number().min(-0.5).max(0.5).default(0.08),
      sigma: z.number().min(0.02).max(1).default(0.2),
    })
    .default({}),
  costs: z
    .object({
      feeBps: z.number().min(0).max(100).default(1),
      slippageBps: z.number().min(0).max(100).default(2),
      initialCapital: z.number().min(1_000).max(1e10).default(1_000_000),
    })
    .default({}),
});

function downsample<T>(xs: T[], max = 400): T[] {
  const step = Math.max(1, Math.ceil(xs.length / max));
  return xs.filter((_, i) => i % step === 0 || i === xs.length - 1);
}

function execute(input: z.infer<typeof backtestInput>) {
  let def: ReturnType<typeof getStrategy>;
  try {
    def = getStrategy(input.engineId);
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Estrategia desconocida: ${input.engineId}` });
  }
  const params = resolveParams(def, input.params);
  const bars = generateBars(input.market);
  const res = runBacktest(bars, def.signal(bars, params), input.costs);
  return {
    engineId: def.id,
    params,
    metrics: res.metrics,
    equity: downsample(res.equity),
    benchmark: downsample(res.benchmark),
    drawdown: downsample(res.drawdown),
    trades: res.trades.slice(-50).reverse(),
  };
}

export const backtestRouter = createTRPCRouter({
  /** Versión pública para la demo de la landing: parámetros por defecto del mercado. */
  preview: publicProcedure
    .input(z.object({ engineId: z.string(), params: z.record(z.number()).default({}) }))
    .query(({ input }) => execute(backtestInput.parse(input))),

  run: protectedProcedure.input(backtestInput).mutation(async ({ ctx, input }) => {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    const used = await ctx.db.backtestRun.count({ where: { userId: ctx.user.id, createdAt: { gte: since } } });
    const limit = getPlan(ctx.user.plan).limits.backtestsPerDay;
    if (used >= limit) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Has usado ${used} de ${limit} backtests de hoy. Mejora tu plan para seguir.`,
      });
    }
    const result = execute(input);
    await ctx.db.backtestRun.create({
      data: {
        userId: ctx.user.id,
        engineId: result.engineId,
        params: result.params,
        config: { market: input.market, costs: input.costs },
        metrics: JSON.parse(JSON.stringify(result.metrics)),
      },
    });
    return { ...result, usage: { used: used + 1, limit } };
  }),

  history: protectedProcedure.query(({ ctx }) =>
    ctx.db.backtestRun.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, engineId: true, params: true, metrics: true, createdAt: true },
    }),
  ),
});
