"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

interface AdminUser { id: string; email?: string; role?: string; plan?: string; trial_end?: string | null; }

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
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
        const res = await fetch("/api/admin/users", { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur de chargement");
        if (mounted) setRows(json.users || []);
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
    return rows.filter(r => (r.email || "").toLowerCase().includes(q) || (r.plan || "").toLowerCase().includes(q) || (r.role || "").toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher (email, plan, rôle)" className="flex-1 rounded border px-3 py-2" />
        </div>

        {error && <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">{error}</div>}

        <div className="bg-white border rounded-xl shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">Rôle</th>
                <th className="p-3 border-b">Plan</th>
                <th className="p-3 border-b">Essai jusqu’au</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} className="p-3 text-center">Chargement…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} className="p-3 text-center text-black/60">Aucun résultat</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-black/5">
                  <td className="p-3 border-b">{u.email || "—"}</td>
                  <td className="p-3 border-b">{u.role || "—"}</td>
                  <td className="p-3 border-b">{u.plan || "—"}</td>
                  <td className="p-3 border-b">{u.trial_end ? new Date(u.trial_end).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}