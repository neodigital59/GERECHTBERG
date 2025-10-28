import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const admin = getAdminClient();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sr = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!admin) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Configuration manquante",
          details: "Définissez SUPABASE_SERVICE_ROLE_KEY dans web/.env.local (clé service_role du projet)",
          env: { NEXT_PUBLIC_SUPABASE_URL: url || null, SUPABASE_SERVICE_ROLE_KEY_set: !!sr && sr !== "YOUR_SUPABASE_SERVICE_ROLE_KEY" },
        }),
        { status: 400 }
      );
    }

    async function tableExists(name: string): Promise<{ exists: boolean; error?: string | null }> {
      try {
        const { error } = await admin.from(name).select("*").limit(0);
        if (error) {
          const msg = (error.message || "").toLowerCase();
          const code = (error as any).code || "";
          if (code === "42P01" || msg.includes("relation") || msg.includes("does not exist") || msg.includes("table")) {
            return { exists: false, error: error.message };
          }
          // Other errors: treat as unknown but table likely exists
          return { exists: true, error: error.message };
        }
        return { exists: true };
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (msg.toLowerCase().includes("relation") || msg.toLowerCase().includes("does not exist")) {
          return { exists: false, error: msg };
        }
        return { exists: true, error: msg };
      }
    }

    const [users, documents, versions, subs, tx, sig, ts] = await Promise.all([
      tableExists("users"),
      tableExists("documents"),
      tableExists("document_versions"),
      tableExists("subscriptions"),
      tableExists("transactions"),
      tableExists("signature_events"),
      tableExists("document_timestamps"),
    ]);

    const missing = [
      { name: "users", ok: users.exists },
      { name: "documents", ok: documents.exists },
      { name: "document_versions", ok: versions.exists },
      { name: "subscriptions", ok: subs.exists },
      { name: "transactions", ok: tx.exists },
      { name: "signature_events", ok: sig.exists },
      { name: "document_timestamps", ok: ts.exists },
    ].filter((t) => !t.ok).map((t) => t.name);

    const ok = missing.length === 0;

    return new Response(
      JSON.stringify({
        ok,
        missing,
        hint: ok
          ? "Tout est en place. Si les insert échouent, vérifiez la ligne utilisateur dans public.users et les politiques RLS."
          : "Exécutez supabase/sql/all_setup.sql dans le Dashboard Supabase, puis Settings > API > Reload schema.",
        details: {
          users,
          documents,
          document_versions: versions,
          subscriptions: subs,
          transactions: tx,
          signature_events: sig,
          document_timestamps: ts,
        },
      }),
      { status: ok ? 200 : 200 }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Erreur de vérification" }), { status: 500 });
  }
}