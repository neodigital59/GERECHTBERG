"use client";
import { useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabaseClient";

interface AdminSub { user_id: string; email?: string | null; plan?: string | null; status?: string | null; start_date?: string | null; end_date?: string | null; stripe_subscription_id?: string | null; cancel_at_period_end?: boolean | null; }

export default function AdminAbonnementsPage() {
  const [rows, setRows] = useState<AdminSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch("/api/admin/abonnements", { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur de chargement");
        if (mounted) setRows(json.subscriptions || []);
      } catch (e: any) {
        if (mounted) setError(e.message || "Erreur inconnue");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      const matchesQuery = !q || [r.email || "", r.plan || "", r.status || ""].some(v => v.toLowerCase().includes(q));
      const matchesStatus = !status || (r.status || "").toLowerCase() === status.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, status]);

  async function cancelSubscription(r: AdminSub) {
    try {
      const body: any = {};
      if (r.stripe_subscription_id) body.stripe_subscription_id = r.stripe_subscription_id;
      else body.user_id = r.user_id;
      const res = await fetch("/api/admin/abonnements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur annulation");
      setRows(rs => rs.map(x => x.user_id === r.user_id ? { ...x, cancel_at_period_end: true } : x));
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    }
  }

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input className="px-3 py-2 border rounded w-64" placeholder="Rechercher email, plan, statut…" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <select className="px-3 py-2 border rounded" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="past_due">En retard</option>
            <option value="unpaid">Impayé</option>
            <option value="incomplete">Incomplet</option>
            <option value="canceled">Annulé</option>
          </select>
        </div>

        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm">{error}</div>}
        {loading && <div className="rounded border bg-white p-4 text-sm">Chargement des abonnements…</div>}

        {!loading && (
          <div className="overflow-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Début</th>
                  <th className="text-left p-3">Fin</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (<tr><td colSpan={6} className="p-4 text-black/60">Aucun abonnement.</td></tr>)}
                {filtered.map(r => (
                  <tr key={`${r.user_id}-${r.stripe_subscription_id || "none"}`} className="border-t align-top">
                    <td className="p-3">{r.email || "-"}</td>
                    <td className="p-3">{r.plan || "-"}</td>
                    <td className="p-3">{r.status || "-"}{r.cancel_at_period_end ? " (annulation programmée)" : ""}</td>
                    <td className="p-3" suppressHydrationWarning>{r.start_date ? new Date(r.start_date).toLocaleString() : "-"}</td>
                    <td className="p-3" suppressHydrationWarning>{r.end_date ? new Date(r.end_date).toLocaleString() : "-"}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1 border rounded" disabled={!!r.cancel_at_period_end || (r.status||"").toLowerCase() !== "active"} onClick={()=>cancelSubscription(r)}>Annuler à la fin</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}