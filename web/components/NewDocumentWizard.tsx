"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CountrySelect from "@/components/CountrySelect";
import { jsPDF } from "jspdf";
import { Document as DocxDocument, Packer, Paragraph } from "docx";
import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";

function classNames(...arr: (string | false | null | undefined)[]) {
  return arr.filter(Boolean).join(" ");
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(digest));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// Register FR locale for reverse country lookups
(countries as any).registerLocale(fr);
const DOC_TYPES = [
  "Lettre de motivation",
  "Contrat de travail",
  "Contrat de prestation de service",
  "Attestation",
  "Attestation de résidence",
  "Lettre administrative",
  "Lettre de résiliation",
  "Accord de confidentialité",
  "Lettre de démission",
];

const TONES = ["Formel", "Neutre", "Amical", "Professionnel"];

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "pt-PT", label: "Português (Portugal)" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
  { code: "pl", label: "Polski" },
  { code: "cs", label: "Čeština" },
  { code: "sk", label: "Slovenčina" },
  { code: "sl", label: "Slovenščina" },
  { code: "hu", label: "Magyar" },
  { code: "ro", label: "Română" },
  { code: "bg", label: "Български" },
  { code: "uk", label: "Українська" },
  { code: "ru", label: "Русский" },
  { code: "sr", label: "Српски" },
  { code: "hr", label: "Hrvatski" },
  { code: "bs", label: "Bosanski" },
  { code: "el", label: "Ελληνικά" },
  { code: "tr", label: "Türkçe" },
  { code: "ar", label: "العربية" },
  { code: "fa", label: "فارسی" },
  { code: "he", label: "עברית" },
  { code: "ur", label: "اردو" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ml", label: "മലയാളം" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "si", label: "සිංහල" },
  { code: "ne", label: "नेपाली" },
  { code: "my", label: "မြန်မာ" },
  { code: "th", label: "ไทย" },
  { code: "km", label: "ភាសាខ្មែរ" },
  { code: "lo", label: "ລາວ" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "fil", label: "Filipino" },
  { code: "zh", label: "中文 (简体)" },
  { code: "zh-Hant", label: "中文 (繁體)" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "sw", label: "Kiswahili" },
  { code: "af", label: "Afrikaans" },
  { code: "sq", label: "Shqip" },
  { code: "et", label: "Eesti" },
  { code: "lv", label: "Latviešu" },
  { code: "lt", label: "Lietuvių" },
  { code: "ga", label: "Gaeilge" },
  { code: "cy", label: "Cymraeg" },
  { code: "is", label: "Íslenska" },
];

function stepLabel(i: number) {
  return ["Type", "Détails", "Rédaction", "Résultat", "Exporter"][i] || String(i);
}

function buildAutoPrompt(typeDoc: string, pays: string, langue: string, ton: string, objectif: string) {
  const paysNom = countries.getName((pays || "").toUpperCase(), "fr") || pays;
  const objectifTxt = objectif ? `\n\nObjectif: ${objectif}.` : "";
  return `Rédiger le texte intégral d’un ${typeDoc}${paysNom?` pour ${paysNom}`:""}, en ${langue}, avec un ton ${ton}.${objectifTxt}\n\nExigences:\n- Produire le document complet prêt à l’usage, sans plan ni liste d’outline\n- Ne pas inclure de balises techniques ni de placeholders\n- Inclure les mentions légales pertinentes (si applicable) et respecter RGPD/eIDAS\n- Adapter le contenu au pays et au type de document`;
}

export default function NewDocumentWizard() {
  const [step, setStep] = useState(0);
  const [typeDoc, setTypeDoc] = useState(DOC_TYPES[0]);
  const [pays, setPays] = useState<string>("FR");
  const [langue, setLangue] = useState<string>("fr");
  const [objectif, setObjectif] = useState<string>("");
  const [ton, setTon] = useState<string>(TONES[3]);
  const [prompt, setPrompt] = useState<string>("");
  const [freeText, setFreeText] = useState<string>("");
  // Ajouter option pour n'utiliser que le prompt avancé
  const [useAdvancedPromptOnly, setUseAdvancedPromptOnly] = useState<boolean>(false);

  const [generating, setGenerating] = useState(false);
  const [rephrasing, setRephrasing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [aiResult, setAiResult] = useState<string>("");
  const [editorContent, setEditorContent] = useState<string>("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [signed, setSigned] = useState(false);
  const [timestamped, setTimestamped] = useState(false);

  const [versions, setVersions] = useState<{ id: string; at: string; label: string; content: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const computedTitle = useMemo(() => {
    const base = typeDoc || "Document";
    const obj = objectif ? ` — ${objectif}` : "";
    return `${base}${obj}`;
  }, [typeDoc, objectif]);

  function addVersion(label: string, content: string) {
    setVersions((v) => [
      { id: Math.random().toString(36).slice(2), at: new Date().toISOString(), label, content },
      ...v,
    ]);
  }

  const applyTemplate = () => {
    const ap = buildAutoPrompt(typeDoc, pays, langue, ton, objectif);
    setPrompt(ap);
  };

  // Quick free-text interpretation
  function inferFromText(text: string) {
    const t = text.toLowerCase();
    let inferredType = "Lettre administrative";
    if (t.includes("démission")) inferredType = "Lettre de démission";
    else if (t.includes("contrat de prestation")) inferredType = "Contrat de prestation de service";
    else if (t.includes("freelance") && t.includes("contrat")) inferredType = "Contrat de prestation de service";
    else if (t.includes("attestation de résidence")) inferredType = "Attestation de résidence";
    else if (t.includes("attestation")) inferredType = "Attestation";
    else if (t.includes("nda") || t.includes("confidentialité")) inferredType = "Accord de confidentialité";
    else if (t.includes("motivation")) inferredType = "Lettre de motivation";
    else if (t.includes("résiliation")) inferredType = "Lettre de résiliation";

    const FR_COUNTRY_MAP: Record<string, string> = {
      "Allemagne": "DE",
      "France": "FR",
      "Belgique": "BE",
      "Suisse": "CH",
      "Espagne": "ES",
      "Italie": "IT",
      "Portugal": "PT",
      "Pays-Bas": "NL",
      "Luxembourg": "LU",
      "Autriche": "AT",
      "Canada": "CA",
    };
    let inferredCountry = "FR";
    for (const name of Object.keys(FR_COUNTRY_MAP)) {
      const re = new RegExp(name, "i");
      if (re.test(text)) { inferredCountry = FR_COUNTRY_MAP[name]; break; }
    }

    let inferredLang = "fr";
    const LANG_HINTS: Record<string, string> = {
      "anglais": "en",
      "allemand": "de",
      "français": "fr",
      "espagnol": "es",
      "italien": "it",
      "portugais": "pt",
      "néerlandais": "nl",
    };
    for (const hint of Object.keys(LANG_HINTS)) {
      const re = new RegExp(`en\\s+${hint}`, "i");
      if (re.test(text)) { inferredLang = LANG_HINTS[hint]; break; }
    }

    let inferredTon = "Neutre";
    if (["contrat", "démission", "résiliation"].some(k => t.includes(k))) inferredTon = "Professionnel";

    let inferredObjectif = "";
    const m = text.match(/pour\s+(.+?)([.!?]|$)/i) || text.match(/afin de\s+(.+?)([.!?]|$)/i);
    if (m && m[1]) inferredObjectif = m[1].trim();

    const auto = buildAutoPrompt(inferredType, inferredCountry, inferredLang, inferredTon, inferredObjectif);
    const combinedPrompt = `${auto}\n\nDétails fournis: ${text.trim()}`;

    return { typeDoc: inferredType, pays: inferredCountry, langue: inferredLang, ton: inferredTon, objectif: inferredObjectif, prompt: combinedPrompt };
  }

  function handleQuickStart() {
    if (!freeText.trim()) return;
    const inf = inferFromText(freeText);
    setTypeDoc(inf.typeDoc);
    setPays(inf.pays);
    setLangue(inf.langue);
    setTon(inf.ton);
    setObjectif(inf.objectif);
    setPrompt(inf.prompt);
    setStep(1);
  }

  async function handleQuickGenerate() {
    if (!freeText.trim()) return;
    const inf = inferFromText(freeText);
    setTypeDoc(inf.typeDoc);
    setPays(inf.pays);
    setLangue(inf.langue);
    setTon(inf.ton);
    setObjectif(inf.objectif);
    setPrompt(inf.prompt);
    await handleGenerate();
  }

  async function autoCreateDraftIfNeeded(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      if (documentId) return documentId;
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          type: typeDoc,
          titre: computedTitle,
          contenu: "",
          langue,
          details: prompt || null,
          statut: "draft",
          hash: null,
        })
        .select("id")
        .maybeSingle();
      if (error) {
        const em = String(error?.message || "");
        const code = String((error as any)?.code || "");
        if (
          code === "42P01" ||
          em.toLowerCase().includes("schema cache") ||
          em.toLowerCase().includes("relation") ||
          em.toLowerCase().includes("table")
        ) {
          setMessage(
            "Base de données non configurée: table 'documents' absente. Exécutez les scripts SQL dans Supabase (web/supabase/sql/schema.sql et web/supabase/sql/policies.sql), puis réessayez."
          );
        } else {
          setMessage(error.message || "Erreur lors de la création du brouillon");
        }
        return null;
      }
      if (data?.id) {
        setDocumentId(data.id);
        return data.id;
      }
    } catch (e: any) {
      const em = String(e?.message || "");
      if (
        em.toLowerCase().includes("schema cache") ||
        em.toLowerCase().includes("relation") ||
        em.toLowerCase().includes("documents")
      ) {
        setMessage(
          "Base de données non configurée: table 'documents' absente. Initialisez le schéma Supabase."
        );
      } else {
        setMessage(e?.message || "Erreur lors de la création du brouillon");
      }
    }
    return documentId;
  }

  async function handleGenerate() {
    setGenerating(true);
    setMessage(null);
    try {
      await autoCreateDraftIfNeeded();
      const detailsBase = [objectif, prompt].filter(Boolean).join(". ");
      const details = (useAdvancedPromptOnly && prompt.trim())
        ? prompt.trim()
        : (detailsBase || buildAutoPrompt(typeDoc, pays, langue, ton, objectif));
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: typeDoc, titre: computedTitle, langue, pays, ton, details }),
      });
      const json = await r.json();
      if (!r.ok) {
        if (r.status === 402) {
          const reason = String(json?.reason || "").toLowerCase();
          const msg =
            reason === "insufficient_credits"
              ? "Crédits OpenRouter épuisés. Ajoutez des crédits ou activez DEMO_MODE=true pour contenu d’exemple."
              : reason === "invalid_key"
                ? "Clé API OpenRouter invalide. Vérifiez OPENROUTER_API_KEY dans .env.local puis redémarrez."
                : json?.error || "Service indisponible.";
          throw new Error(msg);
        }
        throw new Error(json?.error || "Erreur de création");
      }
      const text = json?.result || json?.text || "";
      setAiResult(text);
      setEditorContent(text);
      addVersion("Rédaction", text);
      setStep(3);
      setMessage("Document rédigé");
    } catch (e: any) {
      setMessage(e.message || "Erreur lors de la création");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRephrase() {
    setRephrasing(true);
    setMessage(null);
    try {
      const details = `Reformuler le texte suivant avec un ton ${ton}:\n\n${editorContent}`;
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: typeDoc, titre: computedTitle, langue, pays, ton, details }),
      });
      const json = await r.json();
      if (!r.ok) {
        if (r.status === 402) {
          const reason = String(json?.reason || "").toLowerCase();
          const msg =
            reason === "insufficient_credits"
              ? "Crédits OpenRouter épuisés. Ajoutez des crédits ou activez DEMO_MODE=true pour contenu d’exemple."
              : reason === "invalid_key"
                ? "Clé API OpenRouter invalide. Vérifiez OPENROUTER_API_KEY dans .env.local puis redémarrez."
                : json?.error || "Service indisponible.";
          throw new Error(msg);
        }
        throw new Error(json?.error || "Erreur d’amélioration");
      }
      const text = json?.result || json?.text || "";
      setEditorContent(text);
      addVersion("Amélioration du texte", text);
      setMessage("Texte amélioré");
    } catch (e: any) {
      setMessage(e.message || "Erreur d’amélioration");
    } finally {
      setRephrasing(false);
    }
  }

  async function handleTranslate(target: string) {
    setTranslating(true);
    setMessage(null);
    try {
      if (!editorContent || !editorContent.trim()) {
        setMessage("Rien à traduire. Rédigez ou collez du texte.");
        return;
      }
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editorContent, target }),
      });
      const json = await r.json();
      if (!r.ok) {
        if (r.status === 402) {
          const reason = String(json?.reason || "").toLowerCase();
          const msg =
            reason === "insufficient_credits"
              ? "Crédits OpenRouter épuisés. Ajoutez des crédits ou activez DEMO_MODE=true pour contenu d’exemple."
              : reason === "invalid_key"
                ? "Clé API OpenRouter invalide. Vérifiez OPENROUTER_API_KEY dans .env.local puis redémarrez."
                : json?.error || "Service indisponible.";
          throw new Error(msg);
        }
        throw new Error(json?.error || "Erreur traduction");
      }
      const text = json?.result || "";
      setEditorContent(text);
      addVersion(`Traduction → ${target.toUpperCase()}`, text);
      setLangue(target);
      setMessage("Texte traduit");
    } catch (e: any) {
      setMessage(e.message || "Erreur de traduction");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSaveDraft() {
    setSaving(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Connexion requise");
      const statut = signed ? "signé" : timestamped ? "horodaté" : "draft";
      const hash = timestamped ? await sha256(editorContent) : null;
  
      if (documentId) {
        const { error } = await supabase
          .from("documents")
          .update({
            type: typeDoc,
            titre: computedTitle,
            contenu: editorContent,
            langue,
            details: prompt || null,
            statut,
            hash,
          })
          .eq("id", documentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("documents")
          .insert({
            user_id: user.id,
            type: typeDoc,
            titre: computedTitle,
            contenu: editorContent,
            langue,
            details: prompt || null,
            statut,
            hash,
          })
          .select("id")
          .maybeSingle();
        if (error) throw error;
        const newId = data?.id || null;
        setDocumentId(newId);
        setMessage("Brouillon enregistré");
        return newId;
      }
    } catch (e: any) {
      setMessage(e.message || "Erreur d’enregistrement");
    } finally {
      setSaving(false);
    }
    return documentId;
  }

  const handleFinish = async () => {
    try {
      const id = await handleSaveDraft();
      if (id) {
        window.location.href = `/documents/${id}`;
      } else {
        setMessage("Brouillon enregistré. Identifiant introuvable, veuillez réessayer.");
      }
    } catch (e: any) {
      setMessage(e.message || "Impossible de terminer");
    }
  };

  function sanitizeFilename(name: string | null | undefined, ext: string) {
    const base = (name ?? "").toString().trim();
    let cleaned = base.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").replace(/[. ]+$/g, "");
    if (!cleaned) cleaned = "document";
    const safe = cleaned.replace(/\s+/g, "-");
    const truncated = safe.length > 80 ? safe.slice(0, 80) : safe;
    return `${truncated}.${ext}`;
  }
  function isEmptyWizardContent(): boolean {
    return !editorContent || !editorContent.trim();
  }

  function downloadPdf() {
    if (isEmptyWizardContent()) {
      setMessage("Contenu vide. Ajoutez du texte avant de télécharger.");
      return;
    }
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40;
    const top = 40;
    const lineHeight = 18;
  
    doc.setFont("Times", "Normal");
    doc.setFontSize(18);
    doc.text(computedTitle || "Document", left, top);
  
    doc.setFontSize(12);
    const contentLines = doc.splitTextToSize(editorContent || "", 515);
    let y = top + 30;
    contentLines.forEach((line: string) => {
      if (y > 780) {
        doc.addPage();
        y = top;
      }
      doc.text(line, left, y);
      y += lineHeight;
    });
  
    doc.save(sanitizeFilename(computedTitle, "pdf"));
  }

  async function downloadDocx() {
    if (isEmptyWizardContent()) {
      setMessage("Contenu vide. Ajoutez du texte avant de télécharger.");
      return;
    }
    const paragraphs: Paragraph[] = [];
    paragraphs.push(new Paragraph(computedTitle || "Document"));
    (editorContent || "").split("\n").forEach((line) => {
      paragraphs.push(new Paragraph(line));
    });
  
    const doc = new DocxDocument({ sections: [{ properties: {}, children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = sanitizeFilename(computedTitle, "docx");
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function share() {
    const link = documentId ? `${location.origin}/documents/${documentId}` : null;
    const shareData: ShareData = {
      title: computedTitle || "Document",
      text: link ? `Lien de document: ${link}` : editorContent,
      url: link || undefined,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setMessage("Partagé");
        return;
      } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(link || editorContent || "");
      setMessage(link ? "Lien copié" : "Texte copié");
    } catch (e: any) {
      setMessage("Impossible de partager");
    }
  }

  useEffect(() => {
    // Auto-save meta when leaving step 0 → 1
    if (step === 1) {
      autoCreateDraftIfNeeded();
    }
  }, [step]);

  const helpText = useMemo(() => {
    const code = (pays || "").toUpperCase();
    if (code === "FR") return "France: Respecter les formules de politesse et mentions légales usuelles.";
    if (code === "DE") return "Allemagne: Préciser les références officielles (Aktenzeichen) si applicable.";
    if (code === "BE") return "Belgique: Vérifier la langue appropriée (FR/NL/DE) selon la région.";
    return "Sélectionnez un pays pour afficher l’aide contextuelle.";
  }, [pays]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-xl">GERECHTBERG</div>
        <div className="text-sm text-black/60">Rédaction de documents juridiques</div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 my-4 flex-wrap">
        {[0,1,2,3,4].map((i) => (
          <button
            key={i}
            className={classNames(
              "px-3 py-1 rounded border text-sm",
              step === i ? "bg-brand text-white border-brand" : "bg-white text-black border-black/20"
            )}
            onClick={() => setStep(i)}
          >{stepLabel(i)}</button>
        ))}
        <span className="ml-2 text-sm text-black/60">{stepLabel(step)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main content */}
        <div className="p-4 border rounded bg-white">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Saisie libre</h2>
              <div className="flex flex-col gap-2">
                <input className="w-full border rounded p-2" value={freeText} onChange={(e)=>setFreeText(e.target.value)} placeholder="Écrivez votre besoin en une phrase (ex: Lettre de démission pour mon poste en Allemagne)" />
                <div className="flex gap-2">
                  <button className="px-4 py-2 border rounded" onClick={handleQuickStart}>Interpréter</button>
                  <button className="px-4 py-2 bg-brand text-white rounded" onClick={handleQuickGenerate}>Rédiger maintenant</button>
                </div>
              </div>
              <h2 className="text-lg font-medium mt-4">Informations de base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Type de document</label>
                  <select className="mt-1 w-full border rounded p-2" value={typeDoc} onChange={(e)=>setTypeDoc(e.target.value)}>
                    {DOC_TYPES.map((t)=> <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Pays d’application</label>
                  <CountrySelect value={pays} onChange={(val: string)=>setPays(val)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Langue</label>
                  <select className="mt-1 w-full border rounded p-2" value={langue} onChange={(e)=>setLangue(e.target.value)}>
                    {LANGS.map((l)=> <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Objectif</label>
                  <input className="mt-1 w-full border rounded p-2" value={objectif} onChange={(e)=>setObjectif(e.target.value)} placeholder="ex: Demande d’emploi, Preuve de résidence" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Ton</label>
                  <select className="mt-1 w-full border rounded p-2" value={ton} onChange={(e)=>setTon(e.target.value)}>
                    {TONES.map((t)=> <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button className="px-4 py-2 border rounded" onClick={applyTemplate}>Appliquer le modèle</button>
                <button className="px-4 py-2 bg-brand text-white rounded" onClick={()=>{ if (!prompt) applyTemplate(); setStep(1); }}>Continuer</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Contenu personnalisé</h2>
              <textarea className="w-full border rounded p-2 h-40" value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder="Décrivez votre besoin ou ajoutez des précisions" />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useAdvancedPromptOnly"
                  checked={useAdvancedPromptOnly}
                  onChange={(e)=>setUseAdvancedPromptOnly(e.target.checked)}
                />
                <label htmlFor="useAdvancedPromptOnly" className="text-sm">Utiliser uniquement le prompt avancé</label>
              </div>
              <p className="text-xs text-black/60">Si coché, votre prompt sera utilisé tel quel pour générer le document complet.</p>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-brand text-white rounded disabled:opacity-50" disabled={generating} onClick={handleGenerate}>{generating?"Rédaction...":"Rédiger le document"}</button>
                <button className="px-4 py-2 border rounded" onClick={()=>setStep(0)}>Retour</button>
              </div>
              {message && <div className="text-sm text-blue-600">{message}</div>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Rédaction</h2>
              <p className="text-sm text-black/60">Appuyez sur “Rédiger le document” pour créer le texte adapté.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Résultat</h2>
              <textarea className="w-full border rounded p-2 h-60" value={editorContent} onChange={(e)=>setEditorContent(e.target.value)} />
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-brand text-white rounded disabled:opacity-50" disabled={rephrasing} onClick={handleRephrase}>{rephrasing?"Amélioration...":"Améliorer le texte"}</button>
                <div className="flex items-center gap-2">
                  <select className="border rounded p-2" value={langue} onChange={(e)=>handleTranslate(e.target.value)}>
                    {LANGS.map((l)=> <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                  <button className="px-3 py-2 border rounded disabled:opacity-50" disabled={translating} onClick={()=>handleTranslate(langue)}>{translating?"Traduction...":"Traduire"}</button>
                </div>
                <button className="px-4 py-2 border rounded disabled:opacity-50" disabled={saving} onClick={handleSaveDraft}>{saving?"Enregistrement...":"Enregistrer le brouillon"}</button>
                <button className="px-4 py-2 border rounded" onClick={()=>setStep(4)}>Suivant</button>
              </div>
              {message && <div className="text-sm text-blue-600">{message}</div>}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Actions finales</h2>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50" onClick={downloadPdf} disabled={isEmptyWizardContent()}>Télécharger PDF</button>
                <button className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50" onClick={downloadDocx} disabled={isEmptyWizardContent()}>Télécharger DOCX</button>
                <button className="px-4 py-2 border rounded" onClick={()=>setStep(3)}>Modifier</button>
                <button className="px-4 py-2 border rounded" onClick={share}>Partager</button>
                <button className="px-4 py-2 bg-brand text-white rounded" onClick={handleFinish}>Terminer</button>
              </div>
              {message && <div className="text-sm text-blue-600">{message}</div>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="p-4 border rounded bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium hidden"></h3>
            <button className="text-sm underline" onClick={()=>setSidebarOpen(!sidebarOpen)}>{sidebarOpen?"Réduire l'historique":"Ouvrir l'historique"}</button>
          </div>
          {sidebarOpen && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Historique des versions</p>
                <div className="mt-2 space-y-2 max-h-48 overflow-auto">
                  {versions.length === 0 && <div className="text-black/60">Aucune version pour l’instant.</div>}
                  {versions.map(v=> (
                    <button key={v.id} className="block w-full text-left p-2 border rounded hover:bg-black/5" onClick={()=>setEditorContent(v.content)}>
                      <div className="font-medium">{v.label}</div>
                      <div className="text-xs text-black/60" suppressHydrationWarning>{new Date(v.at).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Modèles suggérés</p>
                <div className="mt-2 flex flex-col gap-2">
                  {["Lettre de motivation","Contrat de travail","Attestation de résidence","Lettre de résiliation","Accord de confidentialité (NDA)","Lettre administrative"].map(m => (
                    <button key={m} className="px-3 py-2 border rounded text-left" onClick={()=>{ 
                      setTypeDoc(m);
                      const p = buildAutoPrompt(m, pays, langue, ton, objectif);
                      setPrompt(p);
                      setStep(1);
                    }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Aide contextuelle</p>
                <p className="mt-1 text-black/70">{helpText}</p>
              </div>
              <div>
                <p className="font-medium">Plan utilisateur</p>
                <p className="text-black/60">Freemium / Premium / Pro selon votre compte.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
      {/* Bouton flottant de signature retiré conformément aux spécifications */}
    </div>
  );
}