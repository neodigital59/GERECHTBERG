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
      const { data: users } = await admin.from("users").select("id, email, trial_end");
      const { data: subs } = await admin.from("subscriptions").select("user_id, status, end_date, plan");

      const now = Date.now();
      const trialsExpiring = (users || []).filter(u => {
        const te = u.trial_end ? Date.parse(u.trial_end) : 0;
        return te > 0 && te - now < 3 * 24 * 60 * 60 * 1000 && te > now; // <3 jours
      }).map(u => ({ user_id: u.id, email: u.email, trial_end: u.trial_end }));

      const paymentIssues = (subs || []).filter(s => {
        const st = (s.status || "").toLowerCase();
        return ["past_due","unpaid","incomplete","canceled"].includes(st);
      }).map(s => ({ user_id: s.user_id, status: s.status, end_date: s.end_date, plan: s.plan }));

      return Response.json({ trialsExpiring, paymentIssues, demo });
    }

    // Fallback: calcul léger pour utilisateur courant
    const u = await requireUser(req);
    if (u instanceof Response) return u;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = req.headers.get("authorization") || req.headers.get("Authorization");
    const userClient = createClient(url, anon, { global: { headers: token ? { Authorization: token } : {} } });

    const { data: me } = await userClient.from("users").select("trial_end").eq("id", u.id).maybeSingle();
    const { data: subs } = await userClient.from("subscriptions").select("status, end_date, plan").eq("user_id", u.id);

    const now = Date.now();
    const trialsExpiring = (me?.trial_end && Date.parse(me.trial_end) - now < 3*24*60*60*1000 && Date.parse(me.trial_end) > now)
      ? [{ user_id: u.id, email: u.email, trial_end: me.trial_end }] : [];

    const paymentIssues = (subs || []).filter(s => ["past_due","unpaid","incomplete","canceled"].includes((s.status||"").toLowerCase()))
      .map(s => ({ user_id: u.id, status: s.status, end_date: s.end_date, plan: s.plan }));

    return Response.json({ trialsExpiring, paymentIssues, demo });
  } catch (e: any) {
    console.error("admin alerts error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur alertes" }), { status: 500 });
  }
}