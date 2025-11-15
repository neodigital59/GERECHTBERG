"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseUtils";
import { jsPDF } from "jspdf";
import { Document as DocxDocument, Packer, Paragraph } from "docx";
import { useTranslation } from "react-i18next";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [doc, setDoc] = useState<any>(null);
  const [content, setContent] = useState("");
  const [lang, setLang] = useState("fr");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [embedded, setEmbedded] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
      if (mounted) {
        setDoc(data);
        // Préférer le champ contenu; si vide mais details présent, utiliser details comme fallback
        const initial = (data?.contenu ?? "").trim();
        const fallback = (data?.details ?? "").trim();
        setContent(initial || fallback || "");
        setLang(data?.langue ?? "fr");
        setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  async function sha256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  async function saveVersionAndUpdate() {
    setLoading(true);
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Service indisponible");
      setLoading(false);
      return;
    }
    try {
      const { data: versions } = await supabase
        .from("document_versions")
        .select("version")
        .eq("document_id", id)
        .order("version", { ascending: false });
      const nextVersion = (versions?.[0]?.version ?? 0) + 1;
      await supabase.from("document_versions").insert({ document_id: id, version: nextVersion, contenu: content });
      await supabase.from("documents").update({ contenu: content, langue: lang }).eq("id", id);
      setMessage(t("documentDetail.msg.savedVersioned"));
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendToDocuSign() {
    setMessage("La signature DocuSign est désactivée dans cette installation.");
  }

  async function timestampDocument() {
    setLoading(true);
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Service indisponible");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/timestamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id, content })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec de l'horodatage");
      setMessage(t("documentDetail.msg.timestamped"));
      const { data } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
      setDoc(data);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  function sanitizeFilename(name: string | null | undefined, ext: string, fallbackId?: string) {
    const base = (name ?? "").toString().trim();
    let cleaned = base.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").replace(/[. ]+$/g, "");
    if (!cleaned) cleaned = fallbackId ? `document-${fallbackId}` : "document";
    const safe = cleaned.replace(/\s+/g, "-");
    const truncated = safe.length > 80 ? safe.slice(0, 80) : safe;
    return `${truncated}.${ext}`;
  }
  function isEmptyContent(): boolean {
    return !content || !content.trim();
  }

  function statusLabel(st: string | null | undefined) {
    const s = (st || "").toLowerCase();
    if (s === "signé") return t("documentDetail.status.signed", "signé");
    if (s === "horodaté") return t("documentDetail.status.timestamped", "horodaté");
    if (s === "draft") return t("documentDetail.status.draft", "brouillon");
    return s || t("documentDetail.status.draft", "brouillon");
  }

  function downloadTxt() {
    if (isEmptyContent()) {
      setMessage(t("documentDetail.msg.emptyContent"));
      return;
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizeFilename(doc?.titre, "txt", id);
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const data = { id, titre: doc?.titre, type: doc?.type, langue: lang, contenu: content, statut: doc?.statut, hash: doc?.hash };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizeFilename(doc?.titre, "json", id);
    a.click();
    URL.revokeObjectURL(url);
  }

  async function shareDocument() {
    const shareData = {
      title: doc?.titre || t("documentDetail.untitled"),
      text: t("documentDetail.share.text"),
      url: location.href,
    };
    if ((navigator as any).share) {
      try { await (navigator as any).share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(location.href);
      setMessage(t("documentDetail.msg.linkCopied"));
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(location.href);
    setMessage(t("documentDetail.msg.linkCopied"));
  }

  function downloadPdf() {
    if (isEmptyContent()) {
      setMessage(t("documentDetail.msg.emptyContent"));
      return;
    }
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const text = `${doc?.titre || t("documentDetail.untitled")}\n\n${content}`;
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
    pdf.save(sanitizeFilename(doc?.titre, "pdf", id));
  }

  async function downloadDocx() {
    if (isEmptyContent()) {
      setMessage(t("documentDetail.msg.emptyContent"));
      return;
    }
    const paragraphs: Paragraph[] = [new Paragraph(doc?.titre || t("documentDetail.untitled"))];
    for (const line of content.split("\n")) {
      paragraphs.push(new Paragraph(line));
    }
    const d = new DocxDocument({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(d);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizeFilename(doc?.titre, "docx", id);
    a.click();
    URL.revokeObjectURL(url);
  }

  async function verifyIntegrity() {
    setLoading(true);
    setMessage(null);
    try {
      if (!doc) throw new Error(t("documentDetail.notFound"));
      const currentHash = await sha256(content);
      if (!doc.hash) {
        setMessage(t("documentDetail.msg.noHash"));
      } else if (currentHash === doc.hash) {
        setMessage(t("documentDetail.msg.integrityOk"));
      } else {
        setMessage(t("documentDetail.msg.integrityAlert"));
      }
    } catch (e: any) {
      setMessage(e.message || t("documentDetail.msg.verifyError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{doc?.titre || t("documentDetail.untitled")}</h1>
          <p className="text-sm text-black/60">{doc?.type || "—"} · {lang.toUpperCase()} · {statusLabel(doc?.statut)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded border" onClick={saveVersionAndUpdate} disabled={loading}>{t("documentDetail.actions.save")}</button>
          <button className="px-3 py-2 rounded border" onClick={shareDocument}>{t("documentDetail.share.share", "Partager")}</button>
        </div>
      </div>

      <textarea value={content} onChange={(e)=>setContent(e.target.value)} className="w-full min-h-[240px] rounded border p-3" placeholder={t("documentDetail.placeholder", "Saisissez ou modifiez le contenu du document") || ""} />

      

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-4 border-b">
          <div className="font-semibold">{t("documentDetail.exports.title", "Export")}</div>
          <div className="text-black/60 text-sm">{t("documentDetail.exports.hint", "Télécharger en PDF, DOCX, TXT ou JSON")}</div>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <button className="px-3 py-2 rounded border" onClick={downloadPdf}>{t("documentDetail.exports.downloadPdf", "PDF")}</button>
          <button className="px-3 py-2 rounded border" onClick={downloadDocx}>{t("documentDetail.exports.downloadDocx", "DOCX")}</button>
          <button className="px-3 py-2 rounded border" onClick={downloadTxt}>{t("documentDetail.exports.downloadTxt", "TXT")}</button>
          <button className="px-3 py-2 rounded border" onClick={exportJSON}>{t("documentDetail.exports.exportJson", "JSON")}</button>
          <button className="px-3 py-2 rounded border" onClick={copyLink}>{t("documentDetail.share.copyLink", "Copier le lien")}</button>
        </div>
      </div>

  {message && <div className="rounded border p-3 text-sm" role="status">{message}</div>}
  </div>
  );
}