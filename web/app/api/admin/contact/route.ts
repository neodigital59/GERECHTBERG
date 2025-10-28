import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const admin = getAdminClient();
    const demo = process.env.DEMO_MODE === "true";
    if (!admin) {
      // Mode dégradé: pas de client admin → renvoyer une liste vide en mode demo
      return Response.json({ messages: [], demo });
    }
    const { data, error } = await admin
      .from("contact_messages")
      .select("id, name, email, message, status, origin, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return Response.json({ messages: data || [], demo });
  } catch (e: any) {
    console.error("admin contact GET error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur messages" }), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = getAdminClient();
    if (!admin) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
    }
    const body = await req.json();
    const id = (body?.id || "").trim();
    const status = (body?.status || "").trim().toLowerCase();
    const allowed = ["new", "in_progress", "replied", "ignored"];
    if (!id || !allowed.includes(status)) {
      return new Response(JSON.stringify({ error: "Paramètres invalides" }), { status: 400 });
    }
    const { error } = await admin
      .from("contact_messages")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e: any) {
    console.error("admin contact PATCH error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur mise à jour" }), { status: 500 });
  }
}