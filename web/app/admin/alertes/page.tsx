"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseUtils";
import RequireAuth from "@/components/RequireAuth";

interface TrialAlert { user_id: string; email?: string; trial_end: string; days_left: number; }
interface PaymentIssue { user_id: string; email?: string; reason?: string; last_attempt?: string | null; }

interface AlertsResponse { trialsExpiringSoon: TrialAlert[]; paymentIssues: PaymentIssue[]; }

export default function AdminAlertsPage() {
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabase();
        if (!supabase) {
          if (mounted) setError("Service indisponible");
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch("/api/admin/alertes", { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur de chargement");
        if (mounted) setData(json);
      } catch (e: any) {
        if (mounted) setError(e.message || "Erreur inconnue");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <RequireAuth>
      <div className="space-y-6">
        {error && <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">{error}</div>}
        {loading && <div className="rounded border bg-white p-4 text-sm">Chargement des alertes…</div>}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="p-4 border-b">
                <div className="font-semibold">Essais arrivant à expiration</div>
                <div className="text-black/60 text-sm">Utilisateurs dont l’essai expire bientôt</div>
              </div>
              <div className="p-4">
                {(data?.trialsExpiringSoon?.length || 0) === 0 ? (
                  <div className="text-sm text-black/60">Aucune alerte d’essai</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="p-2 border-b">Utilisateur</th>
                        <th className="p-2 border-b">Expire le</th>
                        <th className="p-2 border-b">Jours restants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data!.trialsExpiringSoon.map(a => (
                        <tr key={a.user_id} className="hover:bg-black/5">
                          <td className="p-2 border-b">{a.email || a.user_id}</td>
                          <td className="p-2 border-b">{new Date(a.trial_end).toLocaleDateString()}</td>
                          <td className="p-2 border-b">{a.days_left}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm">
              <div className="p-4 border-b">
                <div className="font-semibold">Paiements en échec</div>
                <div className="text-black/60 text-sm">Tentatives de paiement refusées ou expirées</div>
              </div>
              <div className="p-4">
                {(data?.paymentIssues?.length || 0) === 0 ? (
                  <div className="text-sm text-black/60">Aucune alerte de paiement</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="p-2 border-b">Utilisateur</th>
                        <th className="p-2 border-b">Raison</th>
                        <th className="p-2 border-b">Dernière tentative</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data!.paymentIssues.map(p => (
                        <tr key={p.user_id} className="hover:bg-black/5">
                          <td className="p-2 border-b">{p.email || p.user_id}</td>
                          <td className="p-2 border-b">{p.reason || "—"}</td>
                          <td className="p-2 border-b">{p.last_attempt ? new Date(p.last_attempt).toLocaleString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}