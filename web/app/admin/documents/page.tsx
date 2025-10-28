"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

interface AdminDoc { id: string; user_id: string; type?: string | null; titre?: string | null; langue?: string | null; statut?: string | null; date_creation: string; }

export default function AdminDocumentsPage() {
  const [rows, setRows] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch("/api/admin/documents", { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur de chargement");
        if (mounted) setRows(json.documents || []);
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
    if (!q) return rows;
    return rows.filter(r =>
      (r.titre || "").toLowerCase().includes(q) ||
      (r.type || "").toLowerCase().includes(q) ||
      (r.langue || "").toLowerCase().includes(q) ||
      (r.statut || "").toLowerCase().includes(q) ||
      (r.user_id || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher (titre, type, langue, statut, user)" className="flex-1 rounded border px-3 py-2" />
        </div>

        {error && <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">{error}</div>}

        <div className="bg-white border rounded-xl shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3 border-b">Titre</th>
                <th className="p-3 border-b">Type</th>
                <th className="p-3 border-b">Langue</th>
                <th className="p-3 border-b">Statut</th>
                <th className="p-3 border-b">Créé le</th>
                <th className="p-3 border-b">Utilisateur</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="p-3 text-center">Chargement…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-3 text-center text-black/60">Aucun résultat</td></tr>
              )}
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-black/5">
                  <td className="p-3 border-b">{d.titre || "—"}</td>
                  <td className="p-3 border-b">{d.type || "—"}</td>
                  <td className="p-3 border-b">{d.langue || "—"}</td>
                  <td className="p-3 border-b">{d.statut || "—"}</td>
                  <td className="p-3 border-b">{new Date(d.date_creation).toLocaleString()}</td>
                  <td className="p-3 border-b">{d.user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}