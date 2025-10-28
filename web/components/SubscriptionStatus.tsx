"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface SubInfo {
  plan: string | null;
  status: string | null;
  end_date: string | null;
  cancel_at_period_end: boolean | null;
}

export default function SubscriptionStatus() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SubInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setInfo(null);
          setLoading(false);
          return;
        }
        const { data: userRow } = await supabase.from("users").select("plan, trial_end").eq("id", user.id).maybeSingle();
        const { data: subRow } = await supabase
          .from("subscriptions")
          .select("plan, status, end_date, cancel_at_period_end")
          .eq("user_id", user.id)
          .order("start_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        setInfo({
          plan: subRow?.plan ?? userRow?.plan ?? null,
          status: subRow?.status ?? null,
          end_date: subRow?.end_date ?? userRow?.trial_end ?? null,
          cancel_at_period_end: subRow?.cancel_at_period_end ?? null,
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-sm text-black/60">Chargement du statut…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!info) return <div className="text-sm">Non connecté.</div>;

  const isTrial = info.plan === "trial";
  const isFreemium = info.plan === "freemium";
  const isActive = info.status === "active" || info.status === "trialing" || isTrial;

  return (
    <div className="p-3 border rounded bg-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Abonnement: {info.plan ?? "inconnu"}</p>
          <p className="text-sm text-black/60">Statut: {info.status ?? (isTrial ? "trial" : isFreemium ? "freemium" : "-")}</p>
          {info.end_date && (
            <p className="text-sm text-black/60">Fin de période: {new Date(info.end_date).toLocaleDateString()}</p>
          )}
          {info.cancel_at_period_end && (
            <p className="text-sm text-orange-600">Annulation programmée à l’échéance</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end flex-wrap">
          <a href="/tarifs" className="w-full sm:w-auto px-3 py-1 border rounded hover:text-brand">Changer de plan</a>
          <button
            className="w-full sm:w-auto px-3 py-1 bg-brand text-white rounded hover:bg-brand/80"
            onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              const { data: { session } } = await supabase.auth.getSession();
              const token = session?.access_token;
              if (!token) {
                alert("Session expirée. Veuillez vous reconnecter.");
                return;
              }
              const res = await fetch("/api/billing/portal", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ uid: user.id })
              });
              const json = await res.json();
              if (json.url) location.href = json.url;
              else alert(json.error || "Une erreur est survenue.");
            }}
          >Gérer mon abonnement</button>
          <button
            className="w-full sm:w-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              const { data: { session } } = await supabase.auth.getSession();
              const token = session?.access_token;
              if (!token) {
                alert("Session expirée. Veuillez vous reconnecter.");
                return;
              }
              const res = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ uid: user.id })
              });
              const json = await res.json();
              alert(json.message || json.error || "Action effectuée");
            }}
          >Annuler à l’échéance</button>
        </div>
      </div>
    </div>
  );
}