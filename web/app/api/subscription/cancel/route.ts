import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/authServer";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers as any);
    const rl = rateLimit(ip, "subscription_cancel", 10, 60_000);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "Trop de requêtes" }), { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
    }

    const u = await requireUser(req);
    if (u instanceof Response) return u;

    const { uid } = await req.json();
    if (!uid || uid !== u.id) {
      return new Response(JSON.stringify({ error: "uid invalide" }), { status: 403 });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!secret || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Configuration manquante" }), { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: sub, error } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id, cancel_at_period_end, status")
      .eq("user_id", uid)
      .eq("status", "active")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!sub?.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "Aucune souscription active trouvée" }), { status: 404 });
    }
    if (sub.cancel_at_period_end) {
      return new Response(JSON.stringify({ message: "Annulation déjà programmée" }));
    }

    const stripe = new Stripe(secret);
    await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });

    await admin
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("stripe_subscription_id", sub.stripe_subscription_id);

    return Response.json({ message: "Annulation programmée à la fin de la période." });
  } catch (e: any) {
    console.error("Cancel subscription error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur annulation" }), { status: 500 });
  }
}