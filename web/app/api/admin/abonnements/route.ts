import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const admin = getAdminClient();
    const demo = process.env.DEMO_MODE === "true";
    if (!admin) {
      return new Response(JSON.stringify({ error: "Configuration manquante", demo, subscriptions: [] }), { status: 400 });
    }
    const { data: subs, error: e1 } = await admin
      .from("subscriptions")
      .select("user_id, plan, status, start_date, end_date, stripe_subscription_id, cancel_at_period_end")
      .order("end_date", { ascending: false })
      .limit(200);
    if (e1) throw e1;
    const userIds = Array.from(new Set((subs || []).map(s => s.user_id).filter(Boolean)));
    const { data: users, error: e2 } = await admin.from("users").select("id, email, plan").in("id", userIds);
    if (e2) throw e2;
    const byId: Record<string, any> = {};
    (users || []).forEach(u => byId[u.id] = u);
    const items = (subs || []).map(s => ({ ...s, email: byId[s.user_id]?.email || null }));
    return Response.json({ subscriptions: items, demo });
  } catch (e: any) {
    console.error("admin subscriptions GET error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur abonnements" }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminClient();
    if (!admin) return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return new Response(JSON.stringify({ error: "Stripe non configuré" }), { status: 400 });
    const body = await req.json();
    const stripeSubId: string | undefined = body?.stripe_subscription_id;
    const userId: string | undefined = body?.user_id;
    if (!stripeSubId && !userId) return new Response(JSON.stringify({ error: "Paramètres invalides" }), { status: 400 });

    let subId = stripeSubId;
    if (!subId && userId) {
      const { data: sub, error } = await admin
        .from("subscriptions")
        .select("stripe_subscription_id, cancel_at_period_end, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      subId = sub?.stripe_subscription_id || undefined;
      if (!subId) return new Response(JSON.stringify({ error: "Aucune souscription active" }), { status: 404 });
      if (sub?.cancel_at_period_end) return Response.json({ message: "Annulation déjà programmée" });
    }

    const stripe = new Stripe(secret);
    await stripe.subscriptions.update(subId!, { cancel_at_period_end: true });
    await admin.from("subscriptions").update({ cancel_at_period_end: true }).eq("stripe_subscription_id", subId!);
    return Response.json({ ok: true, message: "Annulation programmée à la fin de la période." });
  } catch (e: any) {
    console.error("admin subscriptions POST error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur action abonnement" }), { status: 500 });
  }
}