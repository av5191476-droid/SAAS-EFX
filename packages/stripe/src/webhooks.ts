import type Stripe from "stripe";
import { db } from "@efx/db";
import { getStripe } from "./client";
import { planFromPriceId } from "./plans";

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price.id ?? null;
  const active = sub.status === "active" || sub.status === "trialing";
  await db.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
      plan: active ? planFromPriceId(priceId) : "FREE",
    },
  });
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (userId && customerId) {
        await db.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
      }
      if (typeof session.subscription === "string") {
        await syncSubscription(await getStripe().subscriptions.retrieve(session.subscription));
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
    default:
      break;
  }
}

/** Verifica la firma del webhook y devuelve el evento tipado. */
export function constructWebhookEvent(payload: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET no está configurada");
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}
