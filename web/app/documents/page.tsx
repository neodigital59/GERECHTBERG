"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getSupabase } from "@/lib/supabaseUtils";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import UsageBanner from "@/components/UsageBanner";
import RequireAuth from "@/components/RequireAuth";
import { useTranslation } from "react-i18next";
import PageContent from "@/components/PageContent";

interface DocumentRow {
  id: string;
  titre: string | null;
  type: string | null;
  langue: string | null;
  statut: string | null;
  date_creation: string;
  contenu?: string | null;
}

interface VersionRow {
  document_id: string;
  version: number;
  date_modification: string;
}

function statusClasses(s: string | null) {
  const v = (s || "draft").toLowerCase();
  if (v === "signé") return "bg-green-100 text-green-800";
  if (v === "horodaté") return "bg-blue-100 text-blue-800";
  if (v === "publié") return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-800";
}

function statusIcon(s: string | null) {
  const v = (s || "draft").toLowerCase();
  if (v === "signé") return "✔️";
  if (v === "horodaté") return "⏲️";
  if (v === "publié") return "📄";
  return "📝"; // draft
}

function typeIcon(type: string | null) {
  const t = (type || "").toLowerCase();
  if (t.includes("lettre")) return "✍️";
  if (t.includes("confidentialité") || t.includes("nda")) return "🔏";
  return "📄";
}

async function sha256(text: string) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedCount, setSignedCount] = useState<number>(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [activities, setActivities] = useState<VersionRow[]>([]);
  const [actLoading, setActLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"titre" | "type" | "langue" | "statut" | "date_creation">("date_creation");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendTo, setSendTo] = useState("");
  const [sendSubject, setSendSubject] = useState("Documents GERECHTBERG");
  const [sendBody, setSendBody] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      setActLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) {
        setLoading(false);
        setActLoading(false);
        return;
      }
      const { data: rows } = await supabase
        .from("documents")
        .select("id,titre,type,langue,statut,date_creation,contenu")
        .eq("user_id", uid)
        .order("date_creation", { ascending: false });
      if (mounted) {
        const list = (rows ?? []) as any as DocumentRow[];
        setDocs(list);
        setSignedCount(list.filter((r) => r.statut === "signé").length);
        setLoading(false);
      }
      const { data: versions } = await supabase
        .from("document_versions")
        .select("document_id,version,date_modification")
        .order("date_modification", { ascending: false })
        .limit(6);
      if (mounted) {
        setActivities((versions ?? []) as any as VersionRow[]);
        setActLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Lecture initiale des query params
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q") || "";
    const st = sp.get("statut") || "tous";
    const sb = (sp.get("sort") as any) || "date_creation";
    const sd = (sp.get("dir") as any) || "desc";
    setQuery(q);
    setStatusFilter(st);
    if (["titre", "type", "langue", "statut", "date_creation"].includes(sb)) setSortBy(sb);
    if (["asc", "desc"].includes(sd)) setSortDir(sd);
  }, []);

  // Mise à jour de l'URL quand filtres/tri changent
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("q", query || "");
    url.searchParams.set("statut", statusFilter || "tous");
    url.searchParams.set("sort", sortBy);
    url.searchParams.set("dir", sortDir);
    window.history.replaceState(null, "", url.toString());
  }, [query, statusFilter, sortBy, sortDir]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const d of docs) {
      if (d.statut) set.add(d.statut);
    }
    return ["tous", ...Array.from(set)];
  }, [docs]);

  const titleById = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const d of docs) {
      map.set(d.id, d.titre ?? "Sans titre");
    }
    return map;
  }, [docs]);

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = docs.filter((d) => {
      const matchesQuery =
        q.length === 0 ||
        (d.titre ?? "").toLowerCase().includes(q) ||
        (d.type ?? "").toLowerCase().includes(q) ||
        (d.langue ?? "").toLowerCase().includes(q) ||
        (d.statut ?? "").toLowerCase().includes(q) ||
        (d.contenu ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "tous" || (d.statut ?? "") === statusFilter;
      return matchesQuery && matchesStatus;
    });
    const getVal = (d: DocumentRow) => {
      switch (sortBy) {
        case "titre": return (d.titre ?? "").toLowerCase();
        case "type": return (d.type ?? "").toLowerCase();
        case "langue": return (d.langue ?? "").toLowerCase();
        case "statut": return (d.statut ?? "").toLowerCase();
        case "date_creation": default: return new Date(d.date_creation).getTime();
      }
    };
    return [...base].sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      if (sortDir === "asc") return av > bv ? 1 : av < bv ? -1 : 0;
      return av < bv ? 1 : av > bv ? -1 : 0;
    });
  }, [docs, query, statusFilter, sortBy, sortDir]);

  const lastActivity = docs[0]?.date_creation ? new Date(docs[0].date_creation) : null;
const totalDocs = docs.length;
const signedDocs = signedCount;
const lastActivityLabel = lastActivity ? lastActivity.toLocaleDateString() : "—";

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function signFromList(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("documents").update({ statut: "signé" }).eq("id", id);
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, statut: "signé" } : d)));
  }

  async function timestampFromList(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from("documents").select("contenu").eq("id", id).maybeSingle();
    const text = (data as any)?.contenu || "";
    const hash = await sha256(text);
    await supabase.from("documents").update({ statut: "horodaté", hash }).eq("id", id);
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, statut: "horodaté" } : d)));
  }

  async function duplicateFromList(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) return;
    // Vérification du quota
    try {
      const token = sessionData.session?.access_token;
      const r = await fetch('/api/usage', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const j = await r.json();
      if (r.ok && j?.threshold === 'limit') {
        alert('Quota atteint — duplication bloquée jusqu’à la réinitialisation.');
        return;
      }
    } catch {}
    const { data } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
    if (!data) return;
    const original = data as any;
    const newTitle = `${(original.titre || "Document").slice(0, 180)} (copie)`;
    const { data: ins } = await supabase.from("documents").insert({
      user_id: uid,
      type: original.type,
      titre: newTitle,
      contenu: original.contenu,
      langue: original.langue,
      details: original.details,
      statut: "draft",
    }).select("id").maybeSingle();
    if (ins?.id) {
      location.href = `/documents/${ins.id}`;
    }
  }

  function shareFromList(id: string) {
    const url = `${location.origin}/documents/${id}`;
    navigator.clipboard.writeText(url);
  }

  function exportCsv() {
    const headers = ["id", "titre", "type", "langue", "statut", "date_creation"];
    const rows = filteredDocs.map((d) => [d.id, d.titre ?? "", d.type ?? "", d.langue ?? "", d.statut ?? "", d.date_creation]);
    const esc = (s: any) => String(s ?? "").replace(/"/g, '""');
    const csvBody = rows.map((r) => r.map((v) => `"${esc(v)}"`).join(",")).join("\n");
    const csv = [headers.join(","), csvBody].join("\n");
    const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documents_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Email helpers: sélection et envoi
  function isValidEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds(new Set(filteredDocs.map((d) => d.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function sendEmail() {
    setSendResult(null);
    if (!isValidEmail(sendTo)) { setSendResult("Email destinataire invalide"); return; }
    if (selectedIds.size === 0) { setSendResult("Sélectionnez au moins un document"); return; }
    const supabase = getSupabase();
    if (!supabase) { setSendResult("Service indisponible"); return; }
    try {
      setSendLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const r = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          to: sendTo.trim(),
          subject: sendSubject || 'Documents GERECHTBERG',
          message: sendBody || '',
          documentIds: Array.from(selectedIds),
          format: 'txt',
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || 'Échec envoi email');
      setSendResult(`Email envoyé (${json.sentCount} pièces jointes).`);
      clearSelection();
    } catch (e: any) {
      setSendResult(e?.message || 'Erreur envoi email');
    } finally {
      setSendLoading(false);
    }
  }

  return (
    <RequireAuth>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
            <p className="text-sm text-black/70 dark:text-white/70">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/documents/new" className="w-full sm:w-auto rounded px-3 py-2 bg-brand text-white hover:bg-brand/80">{t('actions.newDocument')}</Link>
            <Link href="/tarifs" className="w-full sm:w-auto rounded px-3 py-2 border hover:text-brand">{t('actions.pricing')}</Link>
          </div>
        </div>
        {/* Bande d'état d'usage */}
        <div className="mt-4">
          <UsageBanner />
        </div>
        {/* Grille principale avec sidebar */}
        <div className="grid xl:grid-cols-4 gap-6 mt-6">
          {/* Barre latérale de navigation */}
          <aside className="hidden xl:block space-y-4">
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <p className="font-medium mb-2">{t('navigation.title')}</p>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/documents" className="px-3 py-2 rounded hover:bg-black/5">{t('navigation.dashboard')}</Link>
                <Link href="/documents/new" className="px-3 py-2 rounded hover:bg-black/5">{t('navigation.newDocument')}</Link>
                <Link href="/tarifs" className="px-3 py-2 rounded hover:bg-black/5">{t('navigation.pricing')}</Link>
                <Link href="/" className="px-3 py-2 rounded hover:bg-black/5">{t('navigation.home')}</Link>
                <Link href="/parametres" className="px-3 py-2 rounded hover:bg-black/5">{t('navigation.settings')}</Link>
              </nav>
            </div>
          </aside>

        {/* Colonne principale: recherche + tableau */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('documents.search.placeholder')}
                className="w-full sm:flex-1 sm:min-w-[240px] border rounded px-3 py-2 text-sm sm:text-base"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto border rounded px-3 py-2"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button onClick={exportCsv} className="w-full sm:w-auto sm:ms-auto rounded px-3 py-2 border hover:text-brand">{t('actions.exportCsv')}</button>
            </div>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-4">
                <div className="space-y-3 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-black/5 rounded-2xl" />
                  ))}
                </div>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-6 text-center bg-white border rounded-xl shadow-sm">
                <p className="text-sm text-black/70 mb-3">{t('documents.emptyState.message')}</p>
                <Link href="/documents/new" className="inline-block px-4 py-2 bg-brand text-white rounded">{t('documents.emptyState.createOne')}</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDocs.map((d) => (
                  <div key={d.id} className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{typeIcon(d.type)}</span>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{d.titre ?? t('documentDetail.untitled')}</div>
                          <div className="text-xs text-black/60 truncate">{d.type ?? "—"} · {d.langue ?? "—"}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${statusClasses(d.statut)}`}>
                        <span className="mr-1">{statusIcon(d.statut)}</span>
                        {d.statut ?? "draft"}
                      </span>
                    </div>
                    {/* Extrait de contenu avec Voir plus / Voir moins */}
                    {(() => {
                      const content = (d.contenu || '').replace(/\s+/g, ' ').trim();
                      const longTitle = (d.titre || '').length > 60;
                      const longContent = content.length > 160;
                      const shouldShowToggle = longTitle || longContent;
                      const isExpanded = expandedIds.has(d.id);
                      const preview = content.slice(0, 160);
                      return (
                        <div className="space-y-2">
                          {content && (
                            <div className="text-sm text-black/70">
                              {isExpanded ? content : preview + (longContent ? '…' : '')}
                            </div>
                          )}
                          {shouldShowToggle && (
                            <button onClick={() => toggleExpand(d.id)} className="text-xs text-brand hover:underline">
                              {isExpanded ? t('cards.seeLess') : t('cards.seeMore')}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex items-center justify-between text-xs text-black/60">
                      <span>Créé le {new Date(d.date_creation).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/documents/${d.id}`} className="px-3 py-2 rounded bg-brand text-white hover:bg-brand/80">{t('actions.open')}</Link>
                      <button onClick={() => shareFromList(d.id)} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{t('actions.share')}</button>
                      <button onClick={() => duplicateFromList(d.id)} className="px-3 py-2 rounded bg-amber-500 text-white hover:bg-amber-600">{t('actions.duplicate')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale: abonnement + activités */}
        <div className="space-y-4">
          <SubscriptionStatus />

          {/* Fonctionnalités à venir: email, signature, horodatage */}
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="font-medium mb-3">{t('dashboard.comingSoon.title', 'Fonctionnalités à venir')}</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2" title={t('dashboard.comingSoon.tooltip', 'Bientôt disponible')}>
                <span className="inline-block w-2 h-2 rounded-full bg-black/30" />
                {t('dashboard.comingSoon.email', 'Envoi par email des documents sélectionnés')}
                <span className="ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs bg-black/5">{t('dashboard.comingSoon.badge', 'Bientôt')}</span>
              </li>
              <li className="flex items-center gap-2" title={t('dashboard.comingSoon.tooltip', 'Bientôt disponible')}>
                <span className="inline-block w-2 h-2 rounded-full bg-black/30" />
                {t('dashboard.comingSoon.signature', 'Signature électronique des documents')}
                <span className="ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs bg-black/5">{t('dashboard.comingSoon.badge', 'Bientôt')}</span>
              </li>
              <li className="flex items-center gap-2" title={t('dashboard.comingSoon.tooltip', 'Bientôt disponible')}>
                <span className="inline-block w-2 h-2 rounded-full bg-black/30" />
                {t('dashboard.comingSoon.timestamp', 'Horodatage des documents')}
                <span className="ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs bg-black/5">{t('dashboard.comingSoon.badge', 'Bientôt')}</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-black/60">{t('dashboard.comingSoon.note', 'Ces fonctionnalités seront bientôt disponibles.')}</p>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="font-medium mb-3">{t('dashboard.recentActivity')}</p>
            {actLoading ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-black/5 rounded" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-black/60">Aucune activité récente.</p>
            ) : (
              <ul className="divide-y">
                {activities.map((a) => (
                  <li key={`${a.document_id}-${a.version}`} className="py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <span className="font-medium">{titleById.get(a.document_id) ?? "Document"}</span>
                        <span className="text-black/60"> · v{a.version}</span>
                      </div>
                      <span className="text-black/60" suppressHydrationWarning>{new Date(a.date_modification).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* Bloc de contenu CMS éditable */}
      <div className="mt-8">
        <PageContent slug="documents" />
      </div>
    </div>
    {/* Boutons flottants retirés: signature & horodatage à venir */}
      </RequireAuth>
    );
}