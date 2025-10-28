import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { requireUser } from "@/lib/authServer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminClient();
    const demo = process.env.DEMO_MODE === "true";
    let users: any[] = [];
    let documents: any[] = [];
    let subscriptions: any[] = [];

    if (admin) {
      const { data: u } = await admin.from("users").select("id, plan, trial_end");
      users = u || [];
      const { data: d } = await admin.from("documents").select("id, langue, statut, date_creation");
      documents = d || [];
      const { data: s } = await admin.from("subscriptions").select("user_id, plan, status, end_date");
      subscriptions = s || [];
    } else {
      const u = await requireUser(req);
      if (u instanceof Response) return u;
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const token = req.headers.get("authorization") || req.headers.get("Authorization");
      const userClient = createClient(url, anon, { global: { headers: token ? { Authorization: token } : {} } });
      const { data: d } = await userClient.from("documents").select("id, langue, statut, date_creation");
      documents = d || [];
      // demo fallback for users & subscriptions
      users = [{ id: u.id, plan: "freemium", trial_end: null }];
      subscriptions = [];
    }

    // Aggregations
    const totalUsers = users.length;
    const plans: Record<string, number> = {};
    for (const u of users) plans[u.plan || "unknown"] = (plans[u.plan || "unknown"] || 0) + 1;

    const totalDocs = documents.length;
    const byLang: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const perDay: Record<string, number> = {};
    for (const d of documents) {
      byLang[d.langue || "-"] = (byLang[d.langue || "-"] || 0) + 1;
      byStatus[d.statut || "-"] = (byStatus[d.statut || "-"] || 0) + 1;
      const day = new Date(d.date_creation).toISOString().slice(0, 10);
      perDay[day] = (perDay[day] || 0) + 1;
    }

    // Normalize last 7 days window
    const days: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const t = new Date(today);
      t.setDate(today.getDate() - i);
      days.push(t.toISOString().slice(0, 10));
    }
    const docsLast7 = days.map((d) => ({ day: d, count: perDay[d] || 0 }));

    const activeSubs = subscriptions.filter(s => (s.status || "").toLowerCase() === "active").length;

    return Response.json({
      kpis: { totalUsers, totalDocs, activeSubs },
      plans,
      byLang,
      byStatus,
      docsLast7,
      demo,
    });
  } catch (e: any) {
    console.error("admin analytics error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur analytics" }), { status: 500 });
  }
}