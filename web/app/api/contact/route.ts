import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    const n = (name || "").trim();
    const e = (email || "").trim();
    const m = (message || "").trim();

    if (!n || !e || !m) {
      return new Response(JSON.stringify({ error: "Tous les champs sont requis" }), { status: 400 });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    if (!emailOk) {
      return new Response(JSON.stringify({ error: "Email invalide" }), { status: 400 });
    }
    if (n.length > 100) {
      return new Response(JSON.stringify({ error: "Nom trop long" }), { status: 400 });
    }
    if (e.length > 254) {
      return new Response(JSON.stringify({ error: "Email trop long" }), { status: 400 });
    }
    if (m.length < 10) {
      return new Response(JSON.stringify({ error: "Message trop court" }), { status: 400 });
    }
    if (m.length > 5000) {
      return new Response(JSON.stringify({ error: "Message trop long" }), { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Configuration Supabase manquante" }), { status: 500 });
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const origin = req.headers.get("origin") || req.headers.get("referer") || null;

    const { data, error } = await admin
      .from("contact_messages")
      .insert({ name: n, email: e, message: m, status: "new", origin })
      .select("id")
      .single();
    if (error) throw error;

    return Response.json({ ok: true, id: data?.id });
  } catch (e: any) {
    console.error("Contact POST error", e);
    return new Response(JSON.stringify({ error: e?.message || "Erreur serveur" }), { status: 500 });
  }
}