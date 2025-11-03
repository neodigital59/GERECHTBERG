import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/authServer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof Response) return user;

    const { appointmentId, windowHours = 24 } = await req.json();
    const apptId = (appointmentId || "").trim();
    if (!apptId) {
      return new Response(JSON.stringify({ error: "appointmentId requis" }), { status: 400 });
    }

    // Supabase client as user (RLS-safe)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const token = req.headers.get("authorization") || req.headers.get("Authorization");
    const userClient = createClient(supabaseUrl, supabaseAnon, { global: { headers: token ? { Authorization: token } : {} } });

    const { data: appt, error: aerr } = await userClient
      .from("appointments")
      .select("id, user_id, title, start_time, end_time, status, created_at, notes")
      .eq("id", apptId)
      .maybeSingle();
    if (aerr) throw aerr;
    if (!appt || appt.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Rendez-vous introuvable" }), { status: 404 });
    }

    const email = (user.email || "").trim();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email utilisateur indisponible" }), { status: 400 });
    }

    const secret = process.env.STRIPE_SECRET_KEY as string | undefined;
    if (!secret || !/^sk_(live|test)_/.test(secret)) {
      return new Response(JSON.stringify({ error: "Clé Stripe serveur manquante ou invalide" }), { status: 500 });
    }
    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

    // Search last succeeded charges for this email within a time window
    const createdAt = appt.created_at ? Date.parse(appt.created_at) : Date.now();
    const windowMs = Math.max(1, Number(windowHours)) * 60 * 60 * 1000;
    const since = Math.floor((createdAt - 5 * 60 * 1000) / 1000); // 5 min avant pour marge
    const until = Math.floor((createdAt + windowMs) / 1000);

    const charges = await stripe.charges.list({
      limit: 50,
      created: { gte: since, lte: until },
    });

    const match = (charges.data || []).find(c => {
      const ok = c.status === "succeeded" && (c.billing_details?.email || "").toLowerCase() === email.toLowerCase();
      return ok;
    });

    if (!match) {
      return Response.json({ paid: false });
    }

    const receiptUrl = match.receipt_url || null;

    // Optionally mark as paid and store receipt in notes (no schema change)
    if ((appt.status || "").toLowerCase() !== "paid") {
      const newNotes = `${appt.notes || ""}\nPaiement confirmé. Charge: ${match.id}${receiptUrl ? ` | Reçu: ${receiptUrl}` : ""}`.trim();
      const { error: uerr } = await userClient
        .from("appointments")
        .update({ status: "paid", notes: newNotes })
        .eq("id", appt.id);
      if (uerr) console.warn("update status error", uerr);
    }

    return Response.json({ paid: true, receipt_url: receiptUrl });
  } catch (e: any) {
    console.error("verify payment error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur vérification paiement" }), { status: 500 });
  }
}