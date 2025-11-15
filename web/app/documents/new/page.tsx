"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import NewDocumentWizard from "@/components/NewDocumentWizard";
import UsageBanner from "@/components/UsageBanner";
import { getSupabase } from "@/lib/supabaseUtils";
import { jsPDF } from "jspdf";
import { Document as DocxDocument, Packer, Paragraph } from "docx";

type CompactDoc = { id: string; titre: string | null; statut: string | null; date_creation: string };

export default function NewDocumentPage() {
  const { t } = useTranslation();
  const [recent, setRecent] = useState<CompactDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) { setLoading(false); return; }
      const { data: rows } = await supabase
        .from("documents")
        .select("id,titre,statut,date_creation")
        .eq("user_id", uid)
        .order("date_creation", { ascending: false })
        .limit(3);
      if (mounted) {
        setRecent((rows ?? []) as any as CompactDoc[]);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  function sanitizeFilename(name: string, ext?: string) {
    const base = (name || "").toString().replace(/[^a-zA-Z0-9-_\.\s]/g, "").trim() || "document";
    const safe = base.replace(/\s+/g, "-");
    const truncated = safe.length > 80 ? safe.slice(0, 80) : safe;
    return ext ? `${truncated}.${ext}` : truncated;
  }

  async function fetchDoc(id: string): Promise<{ titre: string; contenu: string }> {
    const supabase = getSupabase();
    if (!supabase) return { titre: "Document", contenu: "" };
    const { data } = await supabase.from("documents").select("titre,contenu").eq("id", id).maybeSingle();
    return { titre: (data as any)?.titre || "Document", contenu: (data as any)?.contenu || "" };
  }

  async function downloadMd(id: string) {
    const { titre, contenu } = await fetchDoc(id);
    const blob = new Blob([contenu], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizeFilename(String(titre), "md");
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPdf(id: string) {
    const { titre, contenu } = await fetchDoc(id);
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const text = `${titre}\n\n${contenu}`;
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = 14;
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = margin;
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    }
    pdf.save(sanitizeFilename(String(titre), "pdf"));
  }

  async function downloadDocx(id: string) {
    const { titre, contenu } = await fetchDoc(id);
    const paragraphs: Paragraph[] = [new Paragraph(titre)];
    for (const line of contenu.split("\n")) {
      paragraphs.push(new Paragraph(line));
    }
    const d = new DocxDocument({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(d);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizeFilename(String(titre), "docx");
    a.click();
    URL.revokeObjectURL(url);
  }

  async function duplicateDoc(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) return;
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
    if ((ins as any)?.id) {
      location.href = `/documents/${(ins as any).id}`;
    }
  }

  function shareDoc(id: string) {
    const url = `${location.origin}/documents/${id}`;
    navigator.clipboard.writeText(url);
  }

  function editDoc(id: string) {
    location.href = `/documents/${id}`;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <UsageBanner />
      </div>
      <NewDocumentWizard />
      {/* Bloc compact: derniers documents */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium">
            {t('documents.compactRecent.title', { defaultValue: 'Vos derniers documents' })}
          </p>
          <Link href="/documents" className="text-sm hover:text-brand">
            {t('documents.compactRecent.viewAll', { defaultValue: 'Voir tout' })}
          </Link>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          {loading ? (
            <p className="text-sm text-black/60">{t('loading', { defaultValue: 'Chargement…' })}</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-black/60">{t('documents.compactRecent.empty', { defaultValue: 'Aucun document récent.' })}</p>
          ) : (
            <ul className="space-y-3">
              {recent.map(d => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/documents/${d.id}`} className="hover:text-brand truncate">
                      {d.titre || t('documents.untitled', { defaultValue: 'Sans titre' })}
                    </Link>
                    <p className="text-xs text-black/50">{new Date(d.date_creation).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 relative">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === d.id ? null : d.id)}
                        className="px-2 py-1 text-xs rounded border bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === d.id}
                      >
                        ⬇️ {t('documents.actions.download', { defaultValue: 'Télécharger' })}
                      </button>
                      {openMenuId === d.id && (
                        <div className="absolute right-0 mt-1 w-40 rounded border bg-white shadow z-10">
                          <button onClick={() => { setOpenMenuId(null); downloadMd(d.id); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-black/5">📝 Markdown (.md)</button>
                          <button onClick={() => { setOpenMenuId(null); downloadPdf(d.id); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-black/5">📄 PDF</button>
                          <button onClick={() => { setOpenMenuId(null); downloadDocx(d.id); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-black/5">📘 Word (.docx)</button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => duplicateDoc(d.id)} className="px-2 py-1 text-xs rounded border bg-yellow-100 border-yellow-200 text-yellow-800 hover:bg-yellow-200">📄 {t('documents.actions.duplicate', { defaultValue: 'Dupliquer' })}</button>
                    <button onClick={() => editDoc(d.id)} className="px-2 py-1 text-xs rounded border bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-200">✏️ {t('documents.actions.edit', { defaultValue: 'Modifier' })}</button>
                    <button onClick={() => shareDoc(d.id)} className="px-2 py-1 text-xs rounded border bg-green-100 border-green-200 text-green-800 hover:bg-green-200">🔗 {t('documents.actions.share', { defaultValue: 'Partager' })}</button>
                    <Link href={`/documents/${d.id}`} className="px-2 py-1 text-xs rounded bg-brand text-white hover:bg-brand/80">🔍 {t('documents.actions.open', { defaultValue: 'Ouvrir' })}</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}