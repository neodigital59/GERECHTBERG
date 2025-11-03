"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseUtils";
import { useTranslation } from "react-i18next";

type UsageInfo = {
  plan: string;
  max: number | null;
  used: number;
  remaining: number | null;
  threshold: "ok" | "warn" | "limit";
  periodStart: string;
  periodEnd: string | null;
};

function colorFor(threshold: UsageInfo["threshold"]): string {
  switch (threshold) {
    case "warn":
      return "#F59E0B"; // orange
    case "limit":
      return "#EF4444"; // red
    case "ok":
    default:
      return "#10B981"; // green
  }
}

export default function UsageBanner() {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabase();
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const res = await fetch("/api/usage", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur usage");
        if (!cancelled) setUsage(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Erreur");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm text-red-600">
        {t('usage.error', { message: error })}
      </div>
    );
  }
  if (!usage) return null;

  const { used, max, threshold, plan } = usage;
  const pct = max === null ? 0 : Math.min(100, Math.round((used / max) * 100));
  const barColor = colorFor(threshold);
  const isUnlimited = max === null;
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "—";

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-black/70">
            {isUnlimited ? (
              <span>{t('usage.planUnlimited', { plan: planLabel })}</span>
            ) : (
              <span>{t('usage.planUsage', { plan: planLabel, used, max })}</span>
            )}
          </p>
          {!isUnlimited && (
            <span className="text-xs text-black/60">{pct}%</span>
          )}
        </div>
        <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
          <div style={{ width: `${pct}%`, backgroundColor: barColor }} className="h-2 transition-all" />
        </div>
        {threshold === "warn" && (
          <p className="text-xs text-amber-600">{t('usage.warn')}</p>
        )}
        {threshold === "limit" && (
          <p className="text-xs text-red-600">{t('usage.limit')}</p>
        )}
      </div>
    </div>
  );
}