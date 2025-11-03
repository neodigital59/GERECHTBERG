import { NextRequest } from "next/server";
import { requireUser } from "@/lib/authServer";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof Response) return user; // 401 non authentifié

  const admin = getAdminClient();
  if (!admin) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Configuration manquante",
        details: "Définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY côté serveur",
      }),
      { status: 400 }
    );
  }

  try {
    const { id, email, name } = user;
    // Upsert dans public.users pour garantir que les policies RLS fonctionnent
    const { error } = await admin
      .from("users")
      .upsert({ id, email: email ?? null, name: name ?? null }, { onConflict: "id" });

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, user: { id, email: email ?? null, name: name ?? null } }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || "Erreur de synchronisation" }),
      { status: 500 }
    );
  }
}