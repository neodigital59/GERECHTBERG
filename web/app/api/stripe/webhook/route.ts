import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function toISO(sec?: number) {
  return sec ? new Date(sec * 1000).toISOString() : null;
}

function planFromPrice(priceId?: string | null) {
  const basic = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
  const pro = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  const enterprise = process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE;
  if (!priceId) return "premium";
  if (priceId === basic) return "basic";
  if (priceId === pro) return "pro";
  if (priceId === enterprise) return "enterprise";
  return "premium";
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whSecret) {
    return new Response(JSON.stringify({ error: "Secrets Stripe manquants" }), { status: 400 });
  }

  const stripe = new Stripe(secret);
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response(JSON.stringify({ error: "Signature Stripe manquante" }), { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err: any) {
    console.error("Webhook signature error", err);
    return new Response(JSON.stringify({ error: "Signature invalide" }), { status: 400 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const admin = createClient(supabaseUrl, serviceKey);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = (session.metadata as any)?.supabase_user_id || null;
      const customerId = session.customer as string | null;

      // Expand pour récupérer line_items/priceId
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items"] });
      const priceId = (fullSession.line_items?.data?.[0]?.price as Stripe.Price | undefined)?.id || null;
      const plan = planFromPrice(priceId);

      const subId = session.subscription as string | null;
      let current_period_start: number | undefined;
      let current_period_end: number | undefined;
      let status: string | undefined;
      let usedPriceId: string | undefined = priceId || undefined;

      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        current_period_start = sub.current_period_start;
        current_period_end = sub.current_period_end;
        status = sub.status;
        usedPriceId = sub.items.data[0]?.price?.id || usedPriceId;
      } else {
        status = "active";
      }

      if (uid) {
        await admin.from("users").update({ plan, stripe_customer_id: customerId }).eq("id", uid);

        const { data: existing } = await admin
          .from("subscriptions")
          .select("id")
          .eq("user_id", uid)
          .eq("stripe_subscription_id", subId)
          .maybeSingle();

        if (existing) {
          await admin
            .from("subscriptions")
            .update({
              plan,
              status: status || "active",
              start_date: toISO(current_period_start),
              end_date: toISO(current_period_end),
              stripe_price_id: usedPriceId || null,
              cancel_at_period_end: false,
            })
            .eq("id", existing.id);
        } else {
          await admin
            .from("subscriptions")
            .insert({
              user_id: uid,
              plan,
              status: status || "active",
              start_date: toISO(current_period_start),
              end_date: toISO(current_period_end),
              stripe_subscription_id: subId,
              stripe_price_id: usedPriceId || null,
              cancel_at_period_end: false,
            });
        }
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const subId = sub.id;
      const status = sub.status;
      const cancelAtPeriodEnd = sub.cancel_at_period_end || false;
      const current_period_start = sub.current_period_start;
      const current_period_end = sub.current_period_end;
      const priceId = sub.items.data[0]?.price?.id || null;
      const plan = planFromPrice(priceId);

      await admin
        .from("subscriptions")
        .update({
          plan,
          status,
          start_date: toISO(current_period_start),
          end_date: toISO(current_period_end),
          cancel_at_period_end: cancelAtPeriodEnd,
          stripe_price_id: priceId,
        })
        .eq("stripe_subscription_id", subId);
    }

    return Response.json({ received: true });
  } catch (e: any) {
    console.error("Webhook processing error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur interne webhook" }), { status: 500 });
  }
}