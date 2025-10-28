"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import RequireAuth from "@/components/RequireAuth";
import AdminNav from "@/components/AdminNav";
import { supabase } from "@/lib/supabaseClient";
import RichTextEditor from "@/components/RichTextEditor";
import MediaManager from "@/components/MediaManager";
import BlockForm from "@/components/cms/BlockForm";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

type BlockRow = {
  id: string;
  page_id: string;
  type: string;
  content: any;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminPages() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pages, setPages] = useState<PageRow[]>([]);

  // Form state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPublished, setEditPublished] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Bloc state (CMS basé sur des blocs)
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockSuccess, setBlockSuccess] = useState<string | null>(null);

  function defaultBlockContent(type: string) {
    switch (type) {
      case "rich_text":
        return { html: "<p>Nouveau contenu…</p>" };
      case "hero":
        return { title: "Titre du hero", subtitle: "Sous-titre", imageUrl: "", ctaText: "En savoir plus", ctaHref: "#" };
      case "image":
        return { src: "", alt: "Image", caption: "" };
      case "list":
        return { ordered: false, items: ["Élément 1", "Élément 2"] };
      case "button":
        return { text: "Bouton", href: "#", variant: "primary" };
      default:
        return { html: "<p>Bloc</p>" };
    }
  }

  async function loadBlocks(pageId: string) {
    setBlocksLoading(true);
    setBlockError(null);
    setBlockSuccess(null);
    try {
      const { data, error } = await supabase
        .from("page_blocks")
        .select("id, page_id, type, content, order_index, published, created_at, updated_at")
        .eq("page_id", pageId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      setBlocks((data || []) as BlockRow[]);
    } catch (e: any) {
      setBlockError(e?.message || "Chargement des blocs échoué");
    } finally {
      setBlocksLoading(false);
    }
  }

  useEffect(() => {
    if (editId) loadBlocks(editId);
    else setBlocks([]);
  }, [editId]);

  async function createBlock(type: string) {
    if (!editId) return;
    setBlockError(null);
    setBlockSuccess(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) throw new Error('Session requise');
      const nextOrder = (blocks[blocks.length - 1]?.order_index ?? 0) + 1;
      const { data, error } = await supabase
        .from("page_blocks")
        .insert({ page_id: editId, type, content: defaultBlockContent(type), order_index: nextOrder, published: false, author_id: uid })
        .select("id, page_id, type, content, order_index, published, created_at, updated_at")
        .limit(1);
      if (error) throw error;
      const row = (data || [])[0] as BlockRow | undefined;
      setBlocks(prev => row ? [...prev, row] : prev);
      setBlockSuccess("Bloc ajouté");
    } catch (e: any) {
      setBlockError(e?.message || "Ajout du bloc échoué");
    }
  }

  function setBlockLocal(id: string, patch: Partial<BlockRow>) {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function saveBlock(id: string) {
    const b = blocks.find(x => x.id === id);
    if (!b) return;
    setBlockError(null);
    setBlockSuccess(null);
    try {
      const { error } = await supabase
        .from("page_blocks")
        .update({ type: b.type, content: b.content, published: b.published, order_index: b.order_index })
        .eq("id", id);
      if (error) throw error;
      setBlockSuccess("Bloc enregistré");
    } catch (e: any) {
      setBlockError(e?.message || "Enregistrement du bloc échoué");
    }
  }

  async function deleteBlock(id: string) {
    setBlockError(null);
    setBlockSuccess(null);
    try {
      const { error } = await supabase.from("page_blocks").delete().eq("id", id);
      if (error) throw error;
      setBlocks(prev => prev.filter(b => b.id !== id));
      setBlockSuccess("Bloc supprimé");
    } catch (e: any) {
      setBlockError(e?.message || "Suppression du bloc échoué");
    }
  }

  async function duplicateBlock(id: string) {
    const b = blocks.find(x => x.id === id);
    if (!b || !editId) return;
    setBlockError(null);
    setBlockSuccess(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) throw new Error('Session requise');
      const insertOrder = b.order_index + 1;
      // Décale les suivants
      const shifted = blocks.map(x => (x.order_index >= insertOrder ? { ...x, order_index: x.order_index + 1 } : x));
      setBlocks(shifted);
      // Persiste le clone
      const { data, error } = await supabase
        .from("page_blocks")
        .insert({ page_id: editId, type: b.type, content: b.content, order_index: insertOrder, published: false, author_id: uid })
        .select("id, page_id, type, content, order_index, published, created_at, updated_at")
        .limit(1);
      if (error) throw error;
      const row = (data || [])[0] as BlockRow | undefined;
      if (row) setBlocks(prev => {
        const copy = [...prev];
        copy.push(row);
        return copy.sort((a, c) => a.order_index - c.order_index);
      });
      setBlockSuccess("Bloc dupliqué");
    } catch (e: any) {
      setBlockError(e?.message || "Duplication échouée");
    }
  }

  async function moveBlock(id: string, direction: "up" | "down") {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= blocks.length) return;
    const a = blocks[idx];
    const b = blocks[swapWith];
    const newA = { ...a, order_index: b.order_index };
    const newB = { ...b, order_index: a.order_index };
    const next = [...blocks];
    next[idx] = newA;
    next[swapWith] = newB;
    setBlocks(next.sort((x, y) => x.order_index - y.order_index));
    try {
      await supabase.from("page_blocks").update({ order_index: newA.order_index }).eq("id", newA.id);
      await supabase.from("page_blocks").update({ order_index: newB.order_index }).eq("id", newB.id);
    } catch (_) {}
  }

  const APP_PAGE_SEED: { slug: string; title: string; content: string }[] = [
    { slug: "home", title: "Accueil", content: "<p>Bienvenue sur le site.</p>" },
    { slug: "tarifs", title: "Tarifs", content: "<h2>Nos tarifs</h2><p>Renseignez vos offres ici.</p>" },
    { slug: "rendezvous", title: "Rendez-vous", content: "<p>Expliquez le processus de prise de rendez-vous.</p>" },
    { slug: "decouvert", title: "Découverte", content: "<p>Présentez le service et ses atouts.</p>" },
    { slug: "contact", title: "Contact", content: "<p>Coordonnées, horaires et formulaire.</p>" },
    { slug: "documents", title: "Documents", content: "<p>Instructions et ressources.</p>" },
    { slug: "parametres", title: "Paramètres", content: "<p>Paramètres du compte et préférences.</p>" },
  ];

  async function seedAppPages() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) throw new Error("Session requise");
      const slugs = APP_PAGE_SEED.map(s => s.slug);
      const { data: existing, error: selErr } = await supabase
        .from("pages")
        .select("slug")
        .in("slug", slugs);
      if (selErr) throw selErr;
      const existingSet = new Set((existing || []).map(r => r.slug));
      const toInsert = APP_PAGE_SEED.filter(s => !existingSet.has(s.slug));
      if (toInsert.length === 0) {
        setSuccess("Les pages d’app existent déjà.");
      } else {
        const { data, error: insErr } = await supabase
          .from("pages")
          .insert(toInsert.map(s => ({ slug: s.slug, title: s.title, content: s.content, published: false, author_id: uid })))
          .select("id, slug, title, content, published, author_id, created_at, updated_at");
        if (insErr) throw insErr;
        setPages(prev => ([...(data || [] as any[]), ...prev] as PageRow[]));
        setSuccess(`Pages importées: ${toInsert.map(s => s.slug).join(", ")}`);
      }
    } catch (e: any) {
      setError(e?.message || "Import échoué");
    } finally {
      setSaving(false);
    }
  }

  const canCreate = useMemo(() => {
    return !!slug && !!title && !!content && !saving;
  }, [slug, title, content, saving]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // RequireAuth gère l’accès
        // RLS: on peut lire les pages publiées, et nos propres pages
        const { data, error } = await supabase
          .from("pages")
          .select("id, slug, title, content, published, author_id, created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        if (!cancelled) setPages((data || []) as PageRow[]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || t('admin.pages.errors.loadFailed', 'Chargement échoué'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) throw new Error(t('admin.pages.errors.sessionRequired', 'Session requise'));
      const { data, error } = await supabase
        .from("pages")
        .insert({ slug, title, content, published, author_id: uid })
        .select("id, slug, title, content, published, author_id, created_at, updated_at")
        .limit(1);
      if (error) throw error;
      const row = (data || [])[0] as PageRow | undefined;
      setPages(prev => row ? [row, ...prev] : prev);
      setSuccess(t('admin.pages.messages.created', 'Page créée'));
      setSlug("");
      setTitle("");
      setContent("");
      setPublished(false);
    } catch (e: any) {
      setError(e?.message || t('admin.pages.errors.createFailed', 'Création échouée'));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: PageRow) {
    setEditId(p.id);
    setEditSlug(p.slug);
    setEditTitle(p.title);
    setEditContent(p.content);
    setEditPublished(p.published);
    setSuccess(null);
    setError(null);
    // Restaure brouillon local si présent
    let restored = false;
    try {
      const k = `cms:edit:${p.id}`;
      const raw = localStorage.getItem(k);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d?.title === 'string') setEditTitle(d.title);
        if (typeof d?.content === 'string') setEditContent(d.content);
        if (typeof d?.published === 'boolean') setEditPublished(d.published);
        setDraftRestored(true);
        restored = true;
      }
    } catch (_) {}
    // Si aucun brouillon local, charge automatiquement la meilleure version disponible
    if (!restored) {
      // Appel asynchrone après que l'état editId soit posé
      setTimeout(() => { loadPublishedVersion(); }, 0);
    }
  }

  function cancelEdit() {
    setEditId(null);
    setEditSlug("");
    setEditTitle("");
    setEditContent("");
    setEditPublished(false);
  }

  async function loadPublishedVersion() {
    if (!editId) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      // Récupère d’abord la ligne pour obtenir le slug fiable
      const { data: currentRow, error: rowErr } = await supabase
        .from("pages")
        .select("id, slug, title, content, published, updated_at")
        .eq("id", editId)
        .limit(1)
        .maybeSingle();
      if (rowErr) throw rowErr;
      const slug = (currentRow?.slug || editSlug || "").trim();

      // 1) Essaye la dernière version publiée
      const { data: verPub, error: errPub } = await supabase
        .from("page_versions")
        .select("title, content, created_at")
        .eq("page_id", editId)
        .eq("state", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (verPub && !errPub && (verPub.content || "").trim()) {
        setEditTitle(verPub.title || "");
        setEditContent(verPub.content || "");
        setSuccess("Version publiée chargée");
        return;
      }

      // 2) Sinon, dernière version en relecture
      const { data: verReview, error: errReview } = await supabase
        .from("page_versions")
        .select("title, content, created_at")
        .eq("page_id", editId)
        .eq("state", "in_review")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (verReview && !errReview && (verReview.content || "").trim()) {
        setEditTitle(verReview.title || "");
        setEditContent(verReview.content || "");
        setSuccess("Version en relecture chargée");
        return;
      }

      // 3) Sinon, dernière version brouillon
      const { data: verDraft, error: errDraft } = await supabase
        .from("page_versions")
        .select("title, content, created_at")
        .eq("page_id", editId)
        .eq("state", "draft")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (verDraft && !errDraft && (verDraft.content || "").trim()) {
        setEditTitle(verDraft.title || "");
        setEditContent(verDraft.content || "");
        setSuccess("Brouillon chargé");
        return;
      }

      // 4) À défaut, tente de charger le contenu publié par SLUG (même si l’ID diffère)
      if (slug) {
        const { data: bySlugPub, error: bySlugErr } = await supabase
          .from("pages")
          .select("title, content, published, updated_at")
          .eq("slug", slug)
          .eq("published", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!bySlugErr && bySlugPub && (bySlugPub.content || "").trim()) {
          setEditTitle(bySlugPub.title || currentRow?.title || "");
          setEditContent(bySlugPub.content || "");
          setEditPublished(true);
          setSuccess("Contenu publié (par slug) chargé");
          return;
        }
      }

      // 5) Sinon, charge la page actuelle (même si non publiée)
      if (currentRow) {
        const html = (currentRow.content || "").trim();
        if (html) {
          setEditTitle(currentRow.title || "");
          setEditContent(html);
          setEditPublished(!!currentRow.published);
          setSuccess(currentRow.published ? "Contenu publié actuel chargé" : "Contenu de la page chargé");
        } else {
          // Fallback: contenu par défaut si connu pour ce slug
          const seed = APP_PAGE_SEED.find(s => s.slug === slug);
          if (seed && (seed.content || "").trim()) {
            setEditTitle(currentRow.title || seed.title || "");
            setEditContent(seed.content);
            setEditPublished(false);
            setSuccess("Contenu par défaut appliqué (aucune version non vide trouvée)");
          } else {
            setError("Aucune version non vide trouvée");
          }
        }
      } else {
        setError("Aucune version trouvée");
      }
    } catch (e: any) {
      setError(e?.message || "Chargement version publié/brouillon échoué");
    } finally {
      setSaving(false);
    }
  }

  // Charge directement le contenu publié par slug et l’applique à l’éditeur
  async function loadPublicBySlug() {
    const slug = (editSlug || "").trim();
    if (!slug) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("title, content, published")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      const html = (data?.content || "").trim();
      if (html) {
        setEditTitle(data?.title || "");
        setEditContent(html);
        setEditPublished(true);
        setSuccess("Contenu public chargé");
      } else {
        setError("Aucun contenu public pour ce slug");
      }
    } catch (e:any) {
      setError(e?.message || "Chargement du contenu public échoué");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await supabase
        .from("pages")
        .update({ title: editTitle, content: editContent, published: editPublished })
        .eq("id", editId)
        .select("id, slug, title, content, published, author_id, created_at, updated_at")
        .limit(1);
      if (error) throw error;
      const row = (data || [])[0] as PageRow | undefined;
      setPages(prev => prev.map(p => p.id === editId ? (row || p) : p));
      // Historise la version côté Supabase (brouillon ou publiée)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id;
        if (uid) {
          await supabase.from("page_versions").insert({ page_id: editId, title: editTitle, content: editContent, state: editPublished ? 'published' : 'draft', author_id: uid });
        }
      } catch (_) {}
      setSuccess(t('admin.pages.messages.updated', 'Page mise à jour'));
      cancelEdit();
      // Nettoie le brouillon local
      try { localStorage.removeItem(`cms:edit:${editId}`); } catch (_) {}
    } catch (e: any) {
      setError(e?.message || t('admin.pages.errors.updateFailed', 'Mise à jour échouée'));
    } finally {
      setSaving(false);
    }
  }

  async function reloadFromServer() {
    if (!editId) return;
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("pages")
        .select("id, slug, title, content, published, author_id, created_at, updated_at")
        .eq("id", editId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setEditTitle(data.title || "");
        setEditContent(data.content || "");
        setEditPublished(!!data.published);
        setEditSlug(data.slug || editSlug);
        setDraftRestored(false);
      }
    } catch (e:any) {
      setError(e?.message || "Recharge échouée");
    } finally {
      setSaving(false);
    }
  }

  function clearLocalDraft() {
    if (!editId) return;
    try { localStorage.removeItem(`cms:edit:${editId}`); } catch (_) {}
    setDraftRestored(false);
  }

  // Autosave local (édition)
  useEffect(() => {
    if (!editId) return;
    const k = `cms:edit:${editId}`;
    const payload = JSON.stringify({ title: editTitle, content: editContent, published: editPublished, ts: Date.now() });
    try { localStorage.setItem(k, payload); } catch (_) {}
  }, [editId, editTitle, editContent, editPublished]);

  // Autosave local (création) et restauration
  useEffect(() => {
    // Restauration initiale
    try {
      const raw = localStorage.getItem('cms:new');
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d?.slug === 'string' && !slug) setSlug(d.slug);
        if (typeof d?.title === 'string' && !title) setTitle(d.title);
        if (typeof d?.content === 'string' && !content) setContent(d.content);
        if (typeof d?.published === 'boolean') setPublished(d.published);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    const k = `cms:new`;
    const payload = JSON.stringify({ slug, title, content, published, ts: Date.now() });
    try { localStorage.setItem(k, payload); } catch (_) {}
  }, [slug, title, content, published]);

  async function deletePage(id: string) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
      setPages(prev => prev.filter(p => p.id !== id));
      setSuccess(t('admin.pages.messages.deleted', 'Page supprimée'));
      if (editId === id) cancelEdit();
    } catch (e: any) {
      setError(e?.message || t('admin.pages.errors.deleteFailed', 'Suppression échouée'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{t('admin.pages.title', 'Gestion des pages')}</h1>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded border" onClick={seedAppPages} disabled={saving}>Importer pages de l’app</button>
            <AdminNav />
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          <section className="xl:col-span-1 bg-white border rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-2">{t('admin.pages.create.title', 'Créer une page')}</h2>
            <p className="text-sm text-black/70 mb-3">{t('admin.pages.create.desc', 'Définissez le slug, le titre et le contenu HTML.')}</p>
            <form onSubmit={createPage} className="space-y-3">
              <label className="block text-sm">
                Slug
                <input className="mt-1 w-full border rounded px-3 py-2" placeholder="ex: contact" value={slug} onChange={e => setSlug(e.target.value)} required />
              </label>
              <label className="block text-sm">
                Titre
                <input className="mt-1 w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
              </label>
              <div className="block text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span>Contenu (éditeur enrichi)</span>
                </div>
                <RichTextEditor value={content} onChange={setContent} onInsertImage={(cb)=>{ /* ouvre MediaManager pour choisir */ }} />
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-black/60">Gérer les médias</summary>
                  <div className="mt-2">
                    <MediaManager onPickUrl={(url)=>{ setContent(c => `${c}\n<p><img src="${url}" alt=""/></p>`); }} />
                  </div>
                </details>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Prévisualisation</p>
                    <div className="prose dark:prose-invert border rounded p-3" dangerouslySetInnerHTML={{ __html: content || "" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">HTML (lecture)</p>
                    <pre className="text-xs border rounded p-3 overflow-auto max-h-64 whitespace-pre-wrap">{content}</pre>
                  </div>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
                Publié
              </label>
              <button type="submit" className="rounded px-4 py-2 bg-brand text-white disabled:opacity-50" disabled={!canCreate || saving}>
                {saving ? t('admin.pages.create.saving', 'Sauvegarde…') : t('admin.pages.create.submit', 'Créer')}
              </button>
              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-green-700">{success}</div>}
            </form>
          </section>

          <section className="xl:col-span-2 bg-white border rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-2">{t('admin.pages.list.title', 'Pages')}</h2>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-black/5 rounded" />
                ))}
              </div>
            ) : pages.length === 0 ? (
              <p className="text-sm text-black/60">{t('admin.pages.list.empty', 'Aucune page pour le moment.')}</p>
            ) : (
              <ul className="divide-y">
                {pages.map(p => (
                  <li key={p.id} className="py-3">
                    {editId === p.id ? (
                      <div className="space-y-2">
                        <div className="text-xs text-black/50">/{p.slug}</div>
                        {draftRestored && (
                          <div className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-800 border flex items-center gap-2">
                            <span>Brouillon local restauré</span>
                            <button className="px-2 py-0.5 rounded border text-xs" onClick={reloadFromServer} disabled={saving}>Recharger depuis serveur</button>
                            <button className="px-2 py-0.5 rounded border text-xs" onClick={clearLocalDraft}>Effacer brouillon local</button>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <button className="px-2 py-0.5 rounded border" onClick={reloadFromServer} disabled={saving}>{saving ? 'Rechargement…' : 'Recharger depuis serveur'}</button>
                          <button className="px-2 py-0.5 rounded border" onClick={loadPublishedVersion} disabled={saving}>{saving ? 'Chargement…' : 'Charger version publiée'}</button>
                          <button className="px-2 py-0.5 rounded border" onClick={loadPublicBySlug} disabled={saving}>{saving ? 'Chargement…' : 'Charger contenu public'}</button>
                          {error && <span className="text-red-600">{error}</span>}
                          {success && <span className="text-green-700">{success}</span>}
                        </div>
                        <input className="w-full border rounded px-3 py-2" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                        <RichTextEditor value={editContent} onChange={setEditContent} />
                        <details>
                          <summary className="cursor-pointer text-xs text-black/60">Gérer les médias</summary>
                          <div className="mt-2">
                            <MediaManager onPickUrl={(url)=>{ setEditContent(c => `${c}\n<p><img src="${url}" alt=""/></p>`); }} />
                          </div>
                        </details>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editPublished} onChange={e => setEditPublished(e.target.checked)} />
                          Publié
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button className="px-3 py-2 rounded bg-brand text-white disabled:opacity-50" onClick={saveEdit} disabled={saving}>{t('actions.save', 'Enregistrer')}</button>
                          <button className="px-3 py-2 rounded border" onClick={async()=>{
                            if (!editId) return;
                            try {
                              const { data: { user } } = await supabase.auth.getUser();
                              const uid = user?.id;
                              if (!uid) throw new Error('Session requise');
                              await supabase.from('page_versions').insert({ page_id: editId, title: editTitle, content: editContent, state: 'in_review', author_id: uid });
                              setSuccess('Envoyé en relecture');
                            } catch (e:any) { setError(e?.message || 'Échec relecture'); }
                          }}>Envoyer en relecture</button>
                          <button className="px-3 py-2 rounded border" onClick={cancelEdit}>{t('actions.cancel', 'Annuler')}</button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 mt-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Prévisualisation</p>
                            <div className="prose dark:prose-invert border rounded p-3" dangerouslySetInnerHTML={{ __html: editContent || "" }} />
                          </div>
                         <div>
                            <p className="text-sm font-medium mb-1">HTML (lecture)</p>
                            <pre className="text-xs border rounded p-3 overflow-auto max-h-64 whitespace-pre-wrap">{editContent}</pre>
                          </div>
                        </div>
                        {/* Gestion des blocs dynamiques (CMS) */}
                        <div className="mt-6">
                          <p className="text-sm font-medium mb-1">Blocs de la page</p>
                          <p className="text-xs text-black/60 mb-2">Ajoutez, éditez, dupliquez, réordonnez et publiez des blocs. L’affichage public utilise ces blocs.</p>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <select id={`new-block-type-${p.id}`} className="border rounded px-2 py-1 text-sm">
                              <option value="rich_text">Texte enrichi</option>
                              <option value="hero">Hero</option>
                              <option value="image">Image</option>
                              <option value="list">Liste</option>
                              <option value="button">Bouton</option>
                            </select>
                            <button
                              className="px-2 py-1 rounded border text-sm"
                              onClick={() => {
                                const el = document.getElementById(`new-block-type-${p.id}`) as HTMLSelectElement | null;
                                const tp = el?.value || "rich_text";
                                createBlock(tp);
                              }}
                            >Ajouter un bloc</button>
                            <button
                              className="px-2 py-1 rounded border text-sm"
                              onClick={async () => {
                                if (!editId) return;
                                const html = (editContent || '').trim();
                                if (!html) { setBlockError('Aucun contenu HTML à convertir'); return; }
                                try {
                                  const { data: { user } } = await supabase.auth.getUser();
                                  const uid = user?.id;
                                  if (!uid) throw new Error('Session requise');
                                  const nextOrder = (blocks[blocks.length - 1]?.order_index ?? 0) + 1;
                                  const { data, error } = await supabase
                                    .from('page_blocks')
                                    .insert({ page_id: editId, type: 'rich_text', content: { html }, order_index: nextOrder, published: !!editPublished, author_id: uid })
                                    .select('id, page_id, type, content, order_index, published, created_at, updated_at')
                                    .limit(1);
                                  if (error) throw error;
                                  const row = (data || [])[0] as BlockRow | undefined;
                                  setBlocks(prev => row ? [...prev, row] : prev);
                                  setBlockSuccess('Contenu converti en bloc');
                                } catch (e:any) {
                                  setBlockError(e?.message || 'Conversion échouée');
                                }
                              }}
                            >Convertir le contenu en bloc</button>
                            <button className="px-2 py-1 rounded border text-sm" onClick={() => editId && loadBlocks(editId)} disabled={blocksLoading}>{blocksLoading ? 'Chargement…' : 'Recharger les blocs'}</button>
                            {blockError && <span className="text-red-600 text-sm">{blockError}</span>}
                            {blockSuccess && <span className="text-green-700 text-sm">{blockSuccess}</span>}
                          </div>
                          {blocksLoading ? (
                            <div className="space-y-2 animate-pulse">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 bg-black/5 rounded" />
                              ))}
                            </div>
                          ) : blocks.length === 0 ? (
                            <p className="text-sm text-black/60">Aucun bloc pour cette page.</p>
                          ) : (
                            <div className="space-y-4">
                              {blocks.map(b => (
                                <div key={b.id} className="border rounded p-3">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-xs px-2 py-0.5 rounded bg-black/5">{b.type}</span>
                                    <label className="inline-flex items-center gap-1 text-xs">
                                      <input type="checkbox" checked={!!b.published} onChange={e => setBlockLocal(b.id, { published: e.target.checked })} />
                                      Publié
                                    </label>
                                    <span className="text-xs text-black/50">Ordre: {b.order_index}</span>
                                    <div className="flex items-center gap-2 ml-auto">
                                      <button className="px-2 py-1 rounded border text-xs" onClick={() => moveBlock(b.id, 'up')}>Monter</button>
                                      <button className="px-2 py-1 rounded border text-xs" onClick={() => moveBlock(b.id, 'down')}>Descendre</button>
                                      <button className="px-2 py-1 rounded border text-xs" onClick={() => duplicateBlock(b.id)}>Dupliquer</button>
                                      <button className="px-2 py-1 rounded border text-xs" onClick={() => deleteBlock(b.id)}>Supprimer</button>
                                      <button className="px-2 py-1 rounded bg-brand text-white text-xs" onClick={() => saveBlock(b.id)}>Enregistrer</button>
                                    </div>
                                  </div>
                                  <BlockForm
                                    type={b.type as any}
                                    value={b.content}
                                    onChange={(val) => setBlockLocal(b.id, { content: val })}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-1">Page complète (aperçu)</p>
                          <p className="text-xs text-black/60 mb-2">Cet aperçu charge la page publique complète. Les zones non-CMS restent non éditables ici. Enregistrer et publier pour voir le rendu final intégré.</p>
                          <div className="border rounded overflow-hidden">
                            <iframe
                              src={p.slug === 'home' ? '/' : `/${p.slug}`}
                              className="w-full h-[480px] bg-white"
                              title={`Aperçu complet /${p.slug}`}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-black/50">/{p.slug}</span>
                            {p.published ? <span className="inline-block text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Publié</span> : <span className="inline-block text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">Brouillon</span>}
                          </div>
                          <div className="font-medium">{p.title}</div>
                          <div className="text-xs text-black/50" suppressHydrationWarning>
                            MAJ {new Date(p.updated_at).toLocaleString()} · Créé {new Date(p.created_at).toLocaleString()}
                          </div>
                          <a href={`/${p.slug}`} className="inline-block mt-2 text-sm px-3 py-1 rounded border hover:text-brand" target="_blank" rel="noopener noreferrer">Voir</a>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button className="px-3 py-2 rounded border" onClick={() => startEdit(p)}>{t('actions.edit', 'Modifier')}</button>
                          <button className="px-3 py-2 rounded border text-red-700" onClick={() => deletePage(p.id)}>{t('actions.delete', 'Supprimer')}</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}