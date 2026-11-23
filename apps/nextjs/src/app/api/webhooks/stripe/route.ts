import { constructWebhookEvent, handleStripeEvent } from "@efx/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Falta la cabecera stripe-signature", { status: 400 });
  const payload = await req.text();
  let event: ReturnType<typeof constructWebhookEvent>;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    return new Response(`Firma no válida: ${(err as Error).message}`, { status: 400 });
  }
  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error("[stripe] error procesando", event.type, err);
    return new Response("Error procesando el evento", { status: 500 });
  }
  return new Response(null, { status: 200 });
}
