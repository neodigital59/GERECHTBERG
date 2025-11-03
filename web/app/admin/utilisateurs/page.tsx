"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseUtils";
import RequireAuth from "@/components/RequireAuth";

interface AdminUser { id: string; email?: string; role?: string; plan?: string; trial_end?: string | null; }

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [creating, setCreating] = useState(false);

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

        {/* Formulaire d’ajout d’utilisateur */}
        <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
          <div className="font-medium">Ajouter un utilisateur</div>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e)=>setNewEmail(e.target.value)}
              placeholder="Email"
              className="rounded border px-3 py-2 w-full"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              placeholder="Mot de passe (optionnel)"
              className="rounded border px-3 py-2 w-full"
            />
            <select value={newRole} onChange={(e)=>setNewRole(e.target.value)} className="rounded border px-3 py-2 w-full">
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <button
              disabled={creating}
              onClick={async ()=>{
                try {
                  setCreating(true);
                  setError(null);
                  const supabase = getSupabase();
                  const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } } as any;
                  const token = session?.access_token;
                  const res = await fetch("/api/admin/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    body: JSON.stringify({ email: newEmail.trim(), password: newPassword || undefined, role: newRole }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error || "Erreur création utilisateur");
                  setRows(rs => [{ id: json.id, email: json.email, role: json.role }, ...rs]);
                  setNewEmail(""); setNewPassword(""); setNewRole("user");
                } catch (e: any) {
                  setError(e.message || "Erreur inconnue");
                } finally {
                  setCreating(false);
                }
              }}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {creating ? "Ajout…" : "Ajouter"}
            </button>
          </div>
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
                <th className="p-3 border-b">Actions</th>
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
                  <td className="p-3 border-b">
                    <select
                      value={u.role || "user"}
                      onChange={(e)=>{
                        const role = e.target.value;
                        setRows(rs => rs.map(r => r.id === u.id ? { ...r, role } : r));
                      }}
                      className="rounded border px-2 py-1"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3 border-b">{u.plan || "—"}</td>
                  <td className="p-3 border-b">{u.trial_end ? new Date(u.trial_end).toLocaleDateString() : "—"}</td>
                  <td className="p-3 border-b">
                    <button
                      className="px-3 py-1 rounded border hover:bg-black/5"
                      onClick={async ()=>{
                        try {
                          setError(null);
                          const supabase = getSupabase();
                          const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } } as any;
                          const token = session?.access_token;
                          const res = await fetch("/api/admin/users", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                            body: JSON.stringify({ id: u.id, role: u.role || "user" }),
                          });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.error || "Erreur mise à jour rôle");
                        } catch (e: any) {
                          setError(e.message || "Erreur inconnue");
                        }
                      }}
                    >
                      Enregistrer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}