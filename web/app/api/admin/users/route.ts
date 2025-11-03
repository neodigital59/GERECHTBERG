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

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminClient();
    if (!admin) {
      return new Response(JSON.stringify({ error: "Configuration manquante (service_role)" }), { status: 400 });
    }

    // Vérifier que l’appelant est admin
    const u = await requireUser(req);
    if (u instanceof Response) return u;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const token = req.headers.get("authorization") || req.headers.get("Authorization");
    const userClient = createClient(url, anon, { global: { headers: token ? { Authorization: token } : {} } });
    const { data: me, error: meErr } = await userClient.from("users").select("role").eq("id", u.id).maybeSingle();
    if (meErr) throw meErr;
    if (!me || (me.role || "user") !== "admin") {
      return new Response(JSON.stringify({ error: "Accès administrateur requis" }), { status: 403 });
    }

    const { email, password, role = "user", confirmEmail = true } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email requis" }), { status: 400 });
    }

    // Créer l’utilisateur auth via API admin
    const { data: created, error: aerr } = await admin.auth.admin.createUser({
      email,
      password: typeof password === "string" && password.length >= 6 ? password : undefined,
      email_confirm: Boolean(confirmEmail),
    } as any);
    if (aerr) throw aerr;
    const userId = created.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Création utilisateur échouée" }), { status: 500 });
    }

    // Créer/mettre à jour la ligne profil dans public.users
    const { error: perr } = await admin.from("users").upsert({ id: userId, email, role });
    if (perr) throw perr;

    return Response.json({ id: userId, email, role });
  } catch (e: any) {
    console.error("admin users POST error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur création utilisateur" }), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = getAdminClient();
    if (!admin) {
      return new Response(JSON.stringify({ error: "Configuration manquante (service_role)" }), { status: 400 });
    }

    // Vérifier que l’appelant est admin
    const u = await requireUser(req);
    if (u instanceof Response) return u;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const token = req.headers.get("authorization") || req.headers.get("Authorization");
    const userClient = createClient(url, anon, { global: { headers: token ? { Authorization: token } : {} } });
    const { data: me, error: meErr } = await userClient.from("users").select("role").eq("id", u.id).maybeSingle();
    if (meErr) throw meErr;
    if (!me || (me.role || "user") !== "admin") {
      return new Response(JSON.stringify({ error: "Accès administrateur requis" }), { status: 403 });
    }

    const { id, role } = await req.json();
    if (!id || !role) {
      return new Response(JSON.stringify({ error: "id et role requis" }), { status: 400 });
    }

    const { error } = await admin.from("users").update({ role }).eq("id", id);
    if (error) throw error;

    return Response.json({ id, role });
  } catch (e: any) {
    console.error("admin users PATCH error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur mise à jour rôle" }), { status: 500 });
  }
}
