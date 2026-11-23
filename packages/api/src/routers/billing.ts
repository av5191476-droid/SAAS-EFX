import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PLANS, getPlan, getStripe } from "@efx/stripe";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const billingRouter = createTRPCRouter({
  plans: publicProcedure.query(() => PLANS.map(({ priceId: _p, ...rest }) => rest)),

  current: protectedProcedure.query(({ ctx }) => ({
    plan: getPlan(ctx.user.plan),
    periodEnd: ctx.user.stripeCurrentPeriodEnd,
  })),

  checkout: protectedProcedure
    .input(z.object({ plan: z.enum(["ANALYST", "PRO", "INSTITUTIONAL"]), lang: z.string().default("es") }))
    .mutation(async ({ ctx, input }) => {
      const plan = getPlan(input.plan);
      if (!plan.priceId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Falta el price id de Stripe para ${plan.name}.` });
      }
      const stripe = getStripe();
      const base = `${appUrl()}/${input.lang}/dashboard/billing`;
      if (ctx.user.stripeSubscriptionId && ctx.user.stripeCustomerId) {
        const portal = await stripe.billingPortal.sessions.create({
          customer: ctx.user.stripeCustomerId,
          return_url: base,
        });
        return { url: portal.url };
      }
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: ctx.user.stripeCustomerId ? undefined : ctx.user.email,
        customer: ctx.user.stripeCustomerId ?? undefined,
        line_items: [{ price: plan.priceId, quantity: 1 }],
        success_url: `${base}?status=success`,
        cancel_url: `${base}?status=cancel`,
        metadata: { userId: ctx.user.id },
      });
      if (!session.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe no devolvió URL." });
      return { url: session.url };
    }),
});
