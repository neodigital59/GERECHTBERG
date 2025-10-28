"use client";
import { useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/RequireAuth";

type AdminAppointment = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  email?: string | null;
};

export default function AdminRendezvousPage() {
  const [list, setList] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/rendezvous");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Erreur de chargement");
        setList(json.appointments || []);
      } catch (e: any) {
        setError(e?.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list.filter(a => {
      const matchTerm = !term ||
        a.title.toLowerCase().includes(term) ||
        (a.email || "").toLowerCase().includes(term) ||
        (a.notes || "").toLowerCase().includes(term);
      const matchStatus = !status || a.status === status;
      return matchTerm && matchStatus;
    });
  }, [list, q, status]);

  function formatDate(iso: string) {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  }

  function exportCSV() {
    const headers = [
      "id","email","title","notes","start_time","end_time","status","created_at"
    ];
    const rows = filtered.map(a => [
      a.id,
      a.email || "",
      a.title.replaceAll("\n", " "),
      (a.notes || "").replaceAll("\n", " "),
      a.start_time,
      a.end_time,
      a.status,
      a.created_at,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => {
      const s = String(v ?? "");
      const needsQuote = s.includes(",") || s.includes("\n") || s.includes("\"");
      const escaped = s.replaceAll("\"", "\"\"");
      return needsQuote ? `"${escaped}"` : escaped;
    }).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rendezvous-${new Date().toISOString().slice(0,19)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <RequireAuth>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Rendez-vous</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Rechercher par email, titre, notes…"
            className="w-full sm:w-80 px-3 py-2 rounded border"
          />
          <select
            value={status || ""}
            onChange={e => setStatus(e.target.value || null)}
            className="px-3 py-2 rounded border"
          >
            <option value="">Tous statuts</option>
            {["scheduled","completed","canceled"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={exportCSV} className="px-3 py-2 rounded bg-blue-600 text-white">Télécharger CSV</button>
        </div>

        {loading && <div>Chargement…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2 border">Email</th>
                  <th className="text-left px-3 py-2 border">Titre</th>
                  <th className="text-left px-3 py-2 border">Notes</th>
                  <th className="text-left px-3 py-2 border">Début</th>
                  <th className="text-left px-3 py-2 border">Fin</th>
                  <th className="text-left px-3 py-2 border">Statut</th>
                  <th className="text-left px-3 py-2 border">Créé</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border">{a.email || ""}</td>
                    <td className="px-3 py-2 border">{a.title}</td>
                    <td className="px-3 py-2 border">{a.notes || ""}</td>
                    <td className="px-3 py-2 border">{formatDate(a.start_time)}</td>
                    <td className="px-3 py-2 border">{formatDate(a.end_time)}</td>
                    <td className="px-3 py-2 border">{a.status}</td>
                    <td className="px-3 py-2 border">{formatDate(a.created_at)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-gray-500">Aucun rendez-vous</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}