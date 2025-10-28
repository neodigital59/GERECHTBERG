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
      const { data, error } = await admin.from("users").select("id, email, role, plan, trial_end").order("email", { ascending: true });
      if (error) throw error;
      return Response.json({ users: data || [], demo });
    }
    // Fallback: exposer uniquement l’utilisateur courant (pas d’erreur RLS)
    const u = await requireUser(req);
    if (u instanceof Response) return u;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = req.headers.get("authorization") || req.headers.get("Authorization");
    const userClient = createClient(url, anon, { global: { headers: token ? { Authorization: token } : {} } });
    // Charger son abonnement si présent
    const { data: subs } = await userClient.from("subscriptions").select("plan, status, end_date").eq("user_id", u.id).limit(1);
    return Response.json({
      users: [{ id: u.id, email: u.email, role: "user", plan: (subs?.[0]?.plan || "freemium"), trial_end: null }],
      demo,
    });
  } catch (e: any) {
    console.error("admin users error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur utilisateurs" }), { status: 500 });
  }
}
