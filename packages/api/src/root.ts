import { backtestRouter } from "./routers/backtest";
import { billingRouter } from "./routers/billing";
import { fundRouter } from "./routers/fund";
import { strategyRouter } from "./routers/strategy";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  fund: fundRouter,
  strategy: strategyRouter,
  backtest: backtestRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
