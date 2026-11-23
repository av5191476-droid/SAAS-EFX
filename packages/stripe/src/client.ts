import Stripe from "stripe";

let client: Stripe | null = null;

/** Cliente perezoso: no falla en build si la clave aún no está configurada. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_API_KEY;
  if (!key) throw new Error("STRIPE_API_KEY no está configurada");
  client ??= new Stripe(key, { typescript: true });
  return client;
}
