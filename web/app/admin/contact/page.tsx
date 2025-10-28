"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import { jsPDF } from "jspdf";

interface ContactMessage { id: string; name: string; email: string; message: string; status: string; origin?: string | null; created_at: string; }

export default function AdminContactPage() {
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch("/api/admin/contact", { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur de chargement");
        if (mounted) setRows(json.messages || []);
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
      const matchesQuery = !q || (r.name + " " + r.email + " " + r.message).toLowerCase().includes(q) || (r.status || "").toLowerCase().includes(q);
      const matchesStatus = !status || (r.status || "").toLowerCase() === status.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, status]);

  async function updateStatus(id: string, s: string) {
    try {
      const res = await fetch("/api/admin/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: s }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur mise à jour");
      setRows(rs => rs.map(r => r.id === id ? { ...r, status: s } : r));
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    }
  }

  function replyTo(email: string, msg: string) {
    const subject = encodeURIComponent("Réponse GERECHTBERG");
    const body = encodeURIComponent(`Bonjour,\n\nMerci pour votre message:\n\n${msg}\n\nNous revenons vers vous avec les informations demandées.\n\nBien cordialement,\nSupport GERECHTBERG`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  function exportCSV() {
    const picked = filtered.filter(r => selected[r.id]);
    const data = (picked.length ? picked : filtered);
    const headers = ["id","name","email","status","origin","created_at","message"];
    const escape = (v: any) => `"${String(v ?? "").replace(/"/g,'""')}"`;
    const lines = [headers.join(",")].concat(data.map(r => [r.id, r.name, r.email, r.status, r.origin || "", r.created_at, r.message].map(escape).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact_messages_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const picked = filtered.filter(r => selected[r.id]);
    const data = (picked.length ? picked : filtered);
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const lineHeight = 14;
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = margin;
    pdf.text("Messages de contact", margin, y);
    y += lineHeight * 2;
    for (const r of data) {
      const block = `Nom: ${r.name}\nEmail: ${r.email}\nStatut: ${r.status}\nOrigine: ${r.origin || "-"}\nDate: ${new Date(r.created_at).toLocaleString()}\n\nMessage:\n${r.message}\n\n------------------------------\n`;
      const lines = pdf.splitTextToSize(block, maxWidth);
      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) { pdf.addPage(); y = margin; }
        pdf.text(line, margin, y);
        y += lineHeight;
      }
      y += lineHeight;
    }
    pdf.save(`contact_messages_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  function toggle(id: string) {
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }

  return (
    <RequireAuth>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input className="px-3 py-2 border rounded w-64" placeholder="Rechercher nom, email, message…" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <select className="px-3 py-2 border rounded" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="in_progress">En cours</option>
            <option value="replied">Répondu</option>
            <option value="ignored">Ignoré</option>
          </select>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button className="px-3 py-2 border rounded" onClick={exportCSV}>Exporter CSV</button>
            <button className="px-3 py-2 border rounded" onClick={exportPDF}>Télécharger PDF</button>
          </div>
        </div>

        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm">{error}</div>}
        {loading && <div className="rounded border bg-white p-4 text-sm">Chargement des messages…</div>}

        {!loading && (
          <div className="overflow-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Sélection</th>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Message</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-4 text-black/60">Aucun message.</td></tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id} className="border-t align-top">
                    <td className="p-3"><input type="checkbox" checked={!!selected[r.id]} onChange={()=>toggle(r.id)} /></td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3"><a href={`mailto:${r.email}`} className="underline hover:text-brand">{r.email}</a></td>
                    <td className="p-3 max-w-xl"><div className="line-clamp-4 whitespace-pre-wrap">{r.message}</div></td>
                    <td className="p-3">
                      <select className="px-2 py-1 border rounded" value={r.status} onChange={(e)=>updateStatus(r.id, e.target.value)}>
                        {(["new","in_progress","replied","ignored"] as const).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3" suppressHydrationWarning>{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1 border rounded" onClick={()=>replyTo(r.email, r.message)}>Répondre</button>
                        <button className="px-3 py-1 border rounded" onClick={()=>updateStatus(r.id, "in_progress")}>Marquer “En cours”</button>
                        <button className="px-3 py-1 border rounded" onClick={()=>updateStatus(r.id, "replied")}>Marquer “Répondu”</button>
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