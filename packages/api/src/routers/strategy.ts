import { z } from "zod";
import { STRATEGIES, getStrategy, resolveParams } from "@efx/quant";
import { createTRPCRouter, protectedProcedure, publicProcedure, staffProcedure } from "../trpc";

export const strategyRouter = createTRPCRouter({
  /** Catálogo del motor (sin funciones, serializable). */
  catalog: publicProcedure.query(() =>
    STRATEGIES.map(({ signal: _signal, ...rest }) => rest),
  ),

  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.strategy.findMany({ orderBy: [{ status: "asc" }, { weight: "desc" }] }),
  ),

  create: staffProcedure
    .input(
      z.object({
        engineId: z.string(),
        name: z.string().min(2).max(80),
        symbol: z.string().min(1).max(20),
        params: z.record(z.number()).default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const def = getStrategy(input.engineId);
      const fund = await ctx.db.fund.findFirstOrThrow();
      return ctx.db.strategy.create({
        data: {
          fundId: fund.id,
          ownerId: ctx.user.id,
          engineId: def.id,
          name: input.name,
          symbol: input.symbol.toUpperCase(),
          params: resolveParams(def, input.params),
        },
      });
    }),

  setStatus: staffProcedure
    .input(z.object({ id: z.string(), status: z.enum(["RESEARCH", "PAPER", "LIVE", "RETIRED"]) }))
    .mutation(({ ctx, input }) =>
      ctx.db.strategy.update({ where: { id: input.id }, data: { status: input.status } }),
    ),
});
