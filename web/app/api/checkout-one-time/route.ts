import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireUser } from "@/lib/authServer";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { appointmentId, priceId, productId } = await req.json();

    if (!appointmentId || (!priceId && !productId)) {
      return NextResponse.json(
        { error: "appointmentId et priceId ou productId sont requis" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = req.headers.get("authorization") || req.headers.get("Authorization") || undefined;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: token } : {},
      },
    });

    // Vérifier que l'appointment existe, appartient à l'utilisateur et est en pending_payment
    const { data: appointment, error: apptErr } = await supabase
      .from("appointments")
      .select("id, user_id, status")
      .eq("id", appointmentId)
      .maybeSingle();

    if (apptErr) {
      return NextResponse.json({ error: apptErr.message }, { status: 500 });
    }
    if (!appointment) {
      return NextResponse.json({ error: "Appointment introuvable" }, { status: 404 });
    }
    if (appointment.user_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (appointment.status !== "pending_payment") {
      return NextResponse.json({ error: "Statut invalide pour paiement" }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-09-30.acacia" });

    // Déterminer le price à utiliser: soit priceId direct, soit default_price du productId
    let priceToUse: string | null = priceId ?? null;
    if (!priceToUse && productId) {
      try {
        const product = await stripe.products.retrieve(productId, { expand: ["default_price"] });
        const dp: any = product.default_price as any;
        priceToUse = typeof dp === "string" ? dp : dp?.id ?? null;
        if (!priceToUse) {
          return NextResponse.json({ error: "Aucun price associé à ce product" }, { status: 400 });
        }
      } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Produit Stripe introuvable" }, { status: 400 });
      }
    }
    if (!priceToUse) {
      return NextResponse.json({ error: "Price Stripe introuvable" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002";
    const successUrl = `${baseUrl}/rendezvous/confirmation?appointmentId=${encodeURIComponent(
      appointmentId
    )}`;
    const cancelUrl = `${baseUrl}/rendezvous`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceToUse,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        appointmentId: String(appointmentId),
        userId: String(user.id),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("checkout-one-time error", err);
    return NextResponse.json(
      { error: err?.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}