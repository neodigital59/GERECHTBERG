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
      const { data, error } = await admin
        .from("documents")
        .select("id, user_id, type, titre, langue, statut, date_creation")
        .order("date_creation", { ascending: false })
        .limit(200);
      if (error) throw error;
      return Response.json({ documents: data || [], demo });
    }
    // Fallback: documents de l’utilisateur courant
    const u = await requireUser(req);
    if (u instanceof Response) return u;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = req.headers.get("authorization") || req.headers.get("Authorization");
    const userClient = createClient(url, anon, { global: { headers: token ? { Authorization: token } : {} } });
    const { data } = await userClient
      .from("documents")
      .select("id, user_id, type, titre, langue, statut, date_creation")
      .order("date_creation", { ascending: false })
      .limit(200);
    return Response.json({ documents: data || [], demo });
  } catch (e: any) {
    console.error("admin documents error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur documents" }), { status: 500 });
  }
}