"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabaseClient";
import PageContent from "@/components/PageContent";

type Appointment = {
  id: string;
  title: string;
  notes: string | null;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  status: string;
};

function toISO(datetimeLocal: string): string | null {
  if (!datetimeLocal) return null;
  // datetime-local is in local tz; convert to ISO string
  const d = new Date(datetimeLocal);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function RendezVousPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [list, setList] = useState<Appointment[]>([]);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");

  // Édition d’un rendez-vous existant
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStartLocal, setEditStartLocal] = useState("");
  const [editEndLocal, setEditEndLocal] = useState("");

  const canSubmit = useMemo(() => {
    return !!title && !!startLocal && !!endLocal && !saving;
  }, [title, startLocal, endLocal, saving]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // RequireAuth gèrera la redirection; on stoppe ici
          return;
        }
        const { data, error } = await supabase
          .from("appointments")
          .select("id, title, notes, start_time, end_time, status")
          .order("start_time", { ascending: true })
          .limit(50);
        if (error) throw error;
        if (!cancelled) setList((data || []) as Appointment[]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || t("appointments.messages.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const startIso = toISO(startLocal);
      const endIso = toISO(endLocal);
      if (!startIso || !endIso) {
        throw new Error(t("appointments.messages.invalidDates"));
      }
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error(t("appointments.messages.sessionRequired"));
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: uid,
          title,
          notes: notes || null,
          start_time: startIso,
          end_time: endIso,
          status: "scheduled",
        })
        .select("id, title, notes, start_time, end_time, status")
        .limit(1);
      if (error) throw error;
      const created = (data || [])[0] as Appointment | undefined;
      setSuccess(t("appointments.messages.created"));
      setTitle("");
      setNotes("");
      setStartLocal("");
      setEndLocal("");
      setList(prev => created ? [...prev, created] : prev);
    } catch (e: any) {
      setError(e?.message || t("appointments.messages.saveError"));
    } finally {
      setSaving(false);
    }
  }

  function toLocalInputValue(iso: string): string {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    } catch {
      return "";
    }
  }

  function startEdit(a: Appointment) {
    setEditId(a.id);
    setEditTitle(a.title);
    setEditNotes(a.notes || "");
    setEditStartLocal(toLocalInputValue(a.start_time));
    setEditEndLocal(toLocalInputValue(a.end_time));
    setSuccess(null);
    setError(null);
  }

  function cancelEdit() {
    setEditId(null);
    setEditTitle("");
    setEditNotes("");
    setEditStartLocal("");
    setEditEndLocal("");
  }

  async function saveEdit() {
    if (!editId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const sIso = toISO(editStartLocal);
      const eIso = toISO(editEndLocal);
      if (!sIso || !eIso) throw new Error(t("appointments.messages.invalidDates"));
      const { error } = await supabase
        .from("appointments")
        .update({ title: editTitle, notes: editNotes || null, start_time: sIso, end_time: eIso })
        .eq("id", editId);
      if (error) throw error;
      setList(prev => prev.map(a => a.id === editId ? { ...a, title: editTitle, notes: editNotes || null, start_time: sIso!, end_time: eIso! } : a));
      setSuccess(t("appointments.messages.updated"));
      cancelEdit();
    } catch (e: any) {
      setError(e?.message || t("appointments.messages.updateError"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteAppointment(id: string) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setList(prev => prev.filter(a => a.id !== id));
      setSuccess(t("appointments.messages.deleted"));
      if (editId === id) cancelEdit();
    } catch (e: any) {
      setError(e?.message || t("appointments.messages.deleteError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl font-semibold mb-3">{t("appointments.title")}</h1>
        <p className="text-sm text-black/70 mb-6">{t("appointments.description")}</p>

        <form onSubmit={onSubmit} className="space-y-4 border rounded-xl p-4 bg-white shadow-sm">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div>
            <label className="block text-sm mb-1">{t("appointments.form.titleLabel")}</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm sm:text-base"
              placeholder={t("appointments.form.titlePlaceholder")}
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{t("appointments.form.notesLabel")}</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm sm:text-base"
              placeholder={t("appointments.form.notesPlaceholder")}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">{t("appointments.form.startLabel")}</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                value={startLocal}
                onChange={e => setStartLocal(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{t("appointments.form.endLabel")}</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                value={endLocal}
                onChange={e => setEndLocal(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded bg-brand text-white disabled:opacity-50"
              disabled={!canSubmit}
            >{saving ? t("appointments.form.submitting") : t("appointments.form.submit")}</button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">{t("appointments.list.title")}</h2>
          {loading ? (
            <div className="text-sm text-black/70">{t("appointments.list.loading")}</div>
          ) : list.length === 0 ? (
            <div className="text-sm text-black/70">{t("appointments.list.empty")}</div>
          ) : (
            <ul className="space-y-2">
              {list.map(a => (
                <li key={a.id} className="border rounded p-3 bg-white shadow-sm">
                  {editId === a.id ? (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm mb-1">{t("appointments.form.titleLabel")}</label>
                        <input className="w-full border rounded px-3 py-2" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{t("appointments.form.notesLabel")}</label>
                        <textarea className="w-full border rounded px-3 py-2" rows={3} value={editNotes} onChange={e => setEditNotes(e.target.value)} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1">{t("appointments.form.startLabel")}</label>
                          <input type="datetime-local" className="w-full border rounded px-3 py-2 text-sm sm:text-base" value={editStartLocal} onChange={e => setEditStartLocal(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">{t("appointments.form.endLabel")}</label>
                          <input type="datetime-local" className="w-full border rounded px-3 py-2 text-sm sm:text-base" value={editEndLocal} onChange={e => setEditEndLocal(e.target.value)} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button className="w-full sm:w-auto px-3 py-2 rounded bg-brand text-white disabled:opacity-50" onClick={saveEdit} disabled={saving}>{t("appointments.edit.save")}</button>
                        <button className="w-full sm:w-auto px-3 py-2 rounded border" onClick={cancelEdit}>{t("appointments.edit.cancel")}</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-black/70" suppressHydrationWarning>{new Date(a.start_time).toLocaleString()} → {new Date(a.end_time).toLocaleString()}</div>
                      {a.notes && <div className="text-sm mt-1">{a.notes}</div>}
                      <div className="text-xs text-black/50 mt-1">{t("appointments.statusLabel")}: {a.status}</div>
                      <div className="mt-2 flex flex-col sm:flex-row gap-2">
                        <button className="w-full sm:w-auto px-3 py-2 rounded border" onClick={() => startEdit(a)}>{t("appointments.edit.modify")}</button>
                        <button className="w-full sm:w-auto px-3 py-2 rounded border text-red-700" onClick={() => deleteAppointment(a.id)}>{t("appointments.edit.delete")}</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-8">
        <PageContent slug="rendezvous" />
      </div>
    </RequireAuth>
  );
}