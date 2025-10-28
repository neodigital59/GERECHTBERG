import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const { uid, priceId } = await req.json();
    const secret = process.env.STRIPE_SECRET_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const fallbackPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    if (!secret || !(priceId || fallbackPriceId)) {
      return new Response(JSON.stringify({ error: "Clés Stripe manquantes ou priceId absent" }), { status: 400 });
    }

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: (priceId || fallbackPriceId) as string, quantity: 1 },
      ],
      success_url: `${baseUrl}/paiement/success`,
      cancel_url: `${baseUrl}/paiement/cancel`,
      metadata: uid ? { supabase_user_id: uid } : undefined,
      subscription_data: uid ? { metadata: { supabase_user_id: uid } } : undefined,
    });

    return Response.json({ url: session.url });
  } catch (e: any) {
    console.error("Checkout error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur Checkout" }), { status: 500 });
  }
}