import { NextRequest } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    const basic = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    const pro = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
    const enterprise = process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE;
    if (!secret || !basic || !pro || !enterprise) {
      return new Response(
        JSON.stringify({ error: "Configuration Stripe manquante" }),
        { status: 400 }
      );
    }

    const stripe = new Stripe(secret);

    const [basicPrice, proPrice, enterprisePrice] = await Promise.all([
      stripe.prices.retrieve(basic),
      stripe.prices.retrieve(pro),
      stripe.prices.retrieve(enterprise),
    ]);

    const toDto = (p: Stripe.Price) => ({
      id: p.id,
      currency: p.currency,
      unit_amount: p.unit_amount,
      recurring_interval: (p.recurring && p.recurring.interval) || null,
    });

    return Response.json({
      basic: toDto(basicPrice),
      pro: toDto(proPrice),
      enterprise: toDto(enterprisePrice),
    });
  } catch (e: any) {
    console.error("Pricing API error", e);
    return new Response(
      JSON.stringify({ error: e.message || "Erreur interne" }),
      { status: 500 }
    );
  }
}