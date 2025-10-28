import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireUser } from "@/lib/authServer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminClient();
    const demo = process.env.DEMO_MODE === "true";
    if (admin) {
      // Charger tous les rendez-vous avec info utilisateur de base
      const { data: appts, error } = await admin
        .from("appointments")
        .select("id, user_id, title, notes, start_time, end_time, status, created_at")
        .order("start_time", { ascending: false });
      if (error) throw error;
      // Charger emails des utilisateurs
      const userIds = [...new Set((appts || []).map(a => a.user_id))];
      let usersById: Record<string, { email: string | null }> = {};
      if (userIds.length) {
        const { data: users, error: uerr } = await admin
          .from("users")
          .select("id, email")
          .in("id", userIds);
        if (uerr) throw uerr;
        usersById = Object.fromEntries((users || []).map(u => [u.id, { email: u.email || null }]));
      }
      const enriched = (appts || []).map(a => ({
        ...a,
        email: usersById[a.user_id]?.email || null,
      }));
      return Response.json({ appointments: enriched, demo });
    }
    // Fallback: lister uniquement les rendez-vous de l’utilisateur courant via client utilisateur
    const u = await requireUser(req);
    if (u instanceof Response) return u;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = req.headers.get("authorization") || req.headers.get("Authorization");
    const userClient = createClient(url, anon, { global: { headers: token ? { Authorization: token } : {} } });
    const { data, error } = await userClient
      .from("appointments")
      .select("id, user_id, title, notes, start_time, end_time, status, created_at")
      .eq("user_id", u.id)
      .order("start_time", { ascending: false });
    if (error) throw error;
    return Response.json({ appointments: data || [], demo });
  } catch (e: any) {
    console.error("admin rendezvous error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur rendez-vous" }), { status: 500 });
  }
}