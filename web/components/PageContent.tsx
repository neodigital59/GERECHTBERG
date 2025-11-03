"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseUtils";
import BlockRenderer, { CMSBlock } from "@/components/cms/BlockRenderer";

interface Props {
  slug: string;
  className?: string;
}

export default function PageContent({ slug, className }: Props) {
  const [title, setTitle] = useState<string>("");
  const [blocks, setBlocks] = useState<CMSBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = getSupabase();
      if (!supabase) {
        // Supabase non configuré: ignorer le chargement du contenu CMS
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        // 1) Trouver la page publiée par slug
        const { data: page, error: pageErr } = await supabase
          .from("pages")
          .select("id, title")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();
        if (pageErr) throw pageErr;
        if (!page) { setBlocks([]); return; }
        setTitle(page.title || "");

        // 2) Charger ses blocs publiés ordonnés
        const { data: blks, error: blkErr } = await supabase
          .from("page_blocks")
          .select("id, type, content, order_index, published")
          .eq("page_id", page.id)
          .eq("published", true)
          .order("order_index", { ascending: true })
          .limit(200);
        if (blkErr) throw blkErr;
        if (!cancelled) {
          const map: CMSBlock[] = (blks || []).map((b: any) => ({ id: b.id, type: b.type, content: b.content }));
          setBlocks(map);
        }
      } catch {
        if (!cancelled) {
          setBlocks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return null;
  if (!blocks || blocks.length === 0) return null;

  return (
    <section className={className || "mt-6"}>
      {title ? <h2 className="text-xl font-medium mb-2">{title}</h2> : null}
      <BlockRenderer blocks={blocks} />
    </section>
  );
}