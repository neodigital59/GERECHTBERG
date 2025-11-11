"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import RequireAuth from "@/components/RequireAuth";
import { getSupabase } from "@/lib/supabaseUtils";
import PageContent from "@/components/PageContent";
import OneCalEmbed from "@/components/OneCalEmbed";

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
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; start?: string; end?: string }>({});
  const [list, setList] = useState<Appointment[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<Appointment | null>(null);
  const [onecalUrl, setOnecalUrl] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  // Interaction tracking to avoid showing errors before user touches fields
  const [touched, setTouched] = useState<{ title: boolean; start: boolean; end: boolean }>({ title: false, start: false, end: false });
  const [submitted, setSubmitted] = useState(false);

  // Édition d’un rendez-vous existant
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStartLocal, setEditStartLocal] = useState("");
  const [editEndLocal, setEditEndLocal] = useState("");

  const canSubmit = useMemo(() => {
    return !!title && !!startLocal && !!endLocal && !saving && !fieldErrors.title && !fieldErrors.start && !fieldErrors.end;
  }, [title, startLocal, endLocal, saving, fieldErrors]);

  // Validation en temps réel
  useEffect(() => {
    const errs: { title?: string; start?: string; end?: string } = {};
    if (!title.trim()) errs.title = "Titre requis";
    // Dates valides et ordre
    const s = startLocal ? new Date(startLocal).getTime() : NaN;
    const e = endLocal ? new Date(endLocal).getTime() : NaN;
    if (!startLocal || isNaN(s)) errs.start = "Date de début invalide";
    if (!endLocal || isNaN(e)) errs.end = "Date de fin invalide";
    if (!errs.start && !errs.end && s >= e) errs.end = "La fin doit être après le début";
    setFieldErrors(errs);
  }, [title, startLocal, endLocal]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const supabase = getSupabase();
      if (!supabase) {
        // Supabase non configuré: ne pas charger la liste, mais laisser l'embed OneCal s'afficher
        if (!cancelled) setLoading(false);
        return;
      }
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

  // Déterminer s’il existe un rendez-vous payé pour débloquer OneCal
  const hasPaidAppointment = useMemo(() => {
    if (lastCreated && lastCreated.status === "paid") return true;
    return list.some(a => a.status === "paid");
  }, [list, lastCreated]);

  // Choisir l’appointment (payé) pertinent pour récupérer l’URL OneCal côté serveur
  const onecalAppointmentId = useMemo(() => {
    if (lastCreated && lastCreated.status === "paid") return lastCreated.id;
    const paid = [...list]
      .filter(a => a.status === "paid")
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    return paid.length ? paid[0].id : null;
  }, [list, lastCreated]);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!hasPaidAppointment || !onecalAppointmentId) {
        setOnecalUrl(null);
        return;
      }
      try {
        const res = await fetch(`/api/rendezvous/onecal-url?appointmentId=${onecalAppointmentId}`);
        const json = await res.json();
        if (res.ok && json?.url) setOnecalUrl(json.url);
        else setOnecalUrl(null);
      } catch {
        setOnecalUrl(null);
      }
    };
    fetchUrl();
  }, [hasPaidAppointment, onecalAppointmentId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Reveal validation messages on submit attempt
    setSubmitted(true);
    setTouched({ title: true, start: true, end: true });
    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors(prev => ({ ...prev }));
    const supabase = getSupabase();
    if (!supabase) {
      setError("Service indisponible");
      setSaving(false);
      return;
    }
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
          status: "pending_payment",
        })
        .select("id, title, notes, start_time, end_time, status")
        .limit(1);
      if (error) throw error;
      const created = (data || [])[0] as Appointment | undefined;
      setSuccess(t("appointments.summary.created"));
      setTitle("");
      setNotes("");
      setStartLocal("");
      setEndLocal("");
      setLastCreatedId(created?.id || null);
      setLastCreated(created || null);
      setShowSummary(true);
      // Déplacer le focus vers le message de succès
      const el = document.getElementById("submit-success");
      if (el) el.focus();
    } catch (e: any) {
      setError(e?.message || t("appointments.messages.saveError"));
    } finally {
      setSaving(false);
    }
  }

  // Démarrer le paiement à l’acte via Checkout (fallback vers Payment Link si non configuré)
  async function startOneTimeCheckout() {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_PRICE_ID;
    const productId = process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_PRODUCT_ID;
    // Choisir stratégie: si priceId (price_...), utiliser Checkout. Sinon, si productId (prod_...),
    // laisser l'API résoudre le default_price. Sinon, fallback Payment Link.
    if (!priceId && !productId) {
      const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL;
      if (link) {
        window.location.href = link;
        return;
      }
      alert("Configuration Stripe manquante: définissez un priceId (price_...), un productId (prod_...) ou un Payment Link.");
      return;
    }
    const apptId = lastCreatedId;
    if (!apptId) {
      alert("Aucun rendez-vous en attente de paiement. Créez d'abord un rendez-vous.");
      return;
    }
    try {
      // Obtenir le token d'authentification
      const supabase = getSupabase();
      if (!supabase) {
        alert("Service indisponible");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch("/api/checkout-one-time", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(priceId && /^price_/i.test(priceId)
          ? { appointmentId: apptId, priceId }
          : { appointmentId: apptId, productId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Impossible de créer la session de paiement");
      if (json?.url) window.location.href = json.url;
    } catch (e: any) {
      alert(e?.message || "Erreur lors du démarrage du paiement");
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
    const supabase = getSupabase();
    if (!supabase) {
      setError("Service indisponible");
      setSaving(false);
      return;
    }
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
    const supabase = getSupabase();
    if (!supabase) {
      setError("Service indisponible");
      setSaving(false);
      return;
    }
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
        {/* Pré-rendez-vous */}
        <section className="mb-6 rounded-xl border bg-green-50 text-black ring-1 ring-green-200 p-4 sm:p-5 blink-green">
          <h2 className="text-xl font-semibold mb-1">{t("appointments.preFormTitle")}</h2>
        </section>
        {/* OneCal booking embed: affiché uniquement après paiement confirmé */}
        {hasPaidAppointment && onecalUrl && (
          <OneCalEmbed className="mb-8" bookingUrl={onecalUrl} />
        )}

        <h1 className="text-2xl font-semibold mb-3">{t("appointments.title")}</h1>
        <p className="text-sm text-black/70 mb-6">{t("appointments.description")}</p>

        <form onSubmit={onSubmit} className="space-y-4 border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
          <div aria-live="polite" className="space-y-2">
            {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
            {success && <div id="submit-success" tabIndex={-1} className="text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm" role="status">{success}</div>}
          </div>
          <div>
            <label className="block text-sm mb-1">{t("appointments.form.titleLabel")}</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition"
              placeholder={t("appointments.form.titlePlaceholder")}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
              maxLength={200}
              required
            />
            {(touched.title || submitted) && fieldErrors.title && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">{t("appointments.form.notesLabel")}</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition"
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
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition"
                value={startLocal}
                onChange={e => setStartLocal(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, start: true }))}
                required
              />
              {(touched.start || submitted) && fieldErrors.start && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.start}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">{t("appointments.form.endLabel")}</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition"
                value={endLocal}
                onChange={e => setEndLocal(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, end: true }))}
                required
              />
              {(touched.end || submitted) && fieldErrors.end && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.end}</p>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded bg-brand text-white disabled:opacity-50 inline-flex items-center gap-2 hover:bg-brand/90 transition"
              disabled={!canSubmit}
            >
              {saving && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              )}
              {saving ? t("appointments.form.submitting") : t("appointments.form.submit")}
            </button>
          </div>
        </form>

        <div className="mt-8">
          {showSummary ? (
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <h2 className="text-lg font-medium mb-2">{t("appointments.summary.title")}</h2>
              <p className="text-sm text-black/70 mb-4">{t("appointments.summary.text")}</p>
              {lastCreated && (
                <div className="mb-4 text-sm">
                  <div><span className="text-black/50">{t("appointments.form.titleLabel")}:</span> <span className="font-medium">{lastCreated.title}</span></div>
                  <div className="text-black/70" suppressHydrationWarning>
                    <span className="text-black/50">{t("appointments.form.startLabel")}:</span> {new Date(lastCreated.start_time).toLocaleString()} 
                    <span className="text-black/50 ml-2">{t("appointments.form.endLabel")}:</span> {new Date(lastCreated.end_time).toLocaleString()}
                  </div>
                  {lastCreated.notes && (
                    <div className="mt-1"><span className="text-black/50">{t("appointments.form.notesLabel")}:</span> {lastCreated.notes}</div>
                  )}
                  <div className="mt-1 text-xs text-black/60">Statut: pending_payment</div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={startOneTimeCheckout}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {t("appointments.summary.payNow")}
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      <div className="mt-8">
        <PageContent slug="rendezvous" />
      </div>
    </RequireAuth>
  );
}