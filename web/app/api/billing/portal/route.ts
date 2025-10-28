import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/authServer";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers as any);
    const rl = rateLimit(ip, "billing_portal", 10, 60_000);
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!secret || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Configuration manquante" }), { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: userRow, error } = await admin.from("users").select("stripe_customer_id").eq("id", uid).maybeSingle();
    if (error) throw error;
    if (!userRow?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: "Aucun client Stripe associé à cet utilisateur" }), { status: 400 });
    }

    const stripe = new Stripe(secret);
    const session = await stripe.billingPortal.sessions.create({
      customer: userRow.stripe_customer_id,
      return_url: `${baseUrl}/documents`,
    });

    return Response.json({ url: session.url });
  } catch (e: any) {
    console.error("Portal error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur Portail" }), { status: 500 });
  }
}