import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/authServer";

export const runtime = "nodejs";

type PlanKey = "freemium" | "basic" | "trial" | "pro" | "premium" | "enterprise" | "unlimited";

function planMax(plan?: string | null): number | null {
  const p = String(plan || "").toLowerCase();
  if (["freemium", "basic"].includes(p)) return 2;
  if (["trial"].includes(p)) return 15; // trial = pro features for the period
  if (["pro"].includes(p)) return 15;
  if (["enterprise", "premium", "unlimited"].includes(p)) return null; // illimité
  // Fallback: unknown plans treated as pro
  return 15;
}

function startOfMonthISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  return new Date(Date.UTC(y, m, 1, 0, 0, 0)).toISOString();
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof Response) return user;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = req.headers.get("authorization") || req.headers.get("Authorization");
    const supabase = createClient(url, anon, { global: { headers: token ? { Authorization: token } : {} } });

    // Plan depuis la dernière subscription (si existe), sinon fallback table users
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan,status,start_date,end_date,cancel_at_period_end")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: userRow } = await supabase
      .from("users")
      .select("plan, trial_end, trial_start")
      .eq("id", user.id)
      .maybeSingle();

    const plan = (sub?.plan ?? userRow?.plan ?? "freemium") as PlanKey;
    const max = planMax(plan);

    // Détermination de la période courante
    const now = new Date();
    const periodStartISO = sub?.start_date || (userRow?.trial_start ?? startOfMonthISO(now));
    const periodEndISO = sub?.end_date || null;

    // Compter les documents créés dans la période
    let used = 0;
    if (max !== null) {
      const { count } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("date_creation", periodStartISO);
      used = count || 0;
    } else {
      // illimité: on peut aussi renvoyer le comptage pour info
      const { count } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("date_creation", startOfMonthISO(now));
      used = count || 0;
    }

    const remaining = max === null ? null : Math.max(0, max - used);
    const ratio = max === null ? 0 : (used / max);
    const threshold = max === null ? "ok" : (ratio >= 1 ? "limit" : ratio >= 0.8 ? "warn" : "ok");

    return Response.json({
      plan,
      max,
      used,
      remaining,
      threshold, // ok|warn|limit
      periodStart: periodStartISO,
      periodEnd: periodEndISO,
    });
  } catch (e: any) {
    console.error("usage api error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur usage" }), { status: 500 });
  }
}