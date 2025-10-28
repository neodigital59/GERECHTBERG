import { getAdminClient } from "@/lib/supabaseAdmin";
import { updatePage, deletePage } from "../actions";
import Link from "next/link";

export default async function EditPage({ params }: { params: { id: string } }) {
  const supa = getAdminClient();
  if (!supa) return <div className="p-3 border bg-red-50 text-red-700">Configuration Supabase côté serveur absente.</div>;
  const { data: page, error } = await supa.from("pages").select("id, title, slug, content, published").eq("id", params.id).maybeSingle();
  if (error) return <div className="p-3 border bg-red-50 text-red-700">{error.message}</div>;
  if (!page) return <div className="p-3">Page introuvable.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Modifier la page</h2>
      <form action={updatePage} className="space-y-4">
        <input type="hidden" name="id" defaultValue={page.id} />
        <div>
          <label className="block text-sm mb-1">Titre</label>
          <input name="title" type="text" className="w-full border rounded px-3 py-2" defaultValue={page.title} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Slug</label>
          <input name="slug" type="text" className="w-full border rounded px-3 py-2" defaultValue={page.slug} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Contenu (HTML)</label>
          <textarea name="content" rows={12} className="w-full border rounded px-3 py-2" defaultValue={page.content || ""}></textarea>
        </div>
        <div className="flex items-center gap-2">
          <input id="published" name="published" type="checkbox" className="border rounded" defaultChecked={page.published} />
          <label htmlFor="published" className="text-sm">Publié</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 rounded bg-brand text-white">Enregistrer</button>
          <Link href="/admin/pages" className="px-3 py-2 rounded border">Retour</Link>
        </div>
      </form>
      <hr className="my-6" />
      <form action={deletePage} onSubmit={(e) => { if (!confirm("Supprimer cette page ?")) e.preventDefault(); }}>
        <input type="hidden" name="id" defaultValue={page.id} />
        <input type="hidden" name="slug" defaultValue={page.slug} />
        <button type="submit" className="px-3 py-2 rounded border text-red-700 border-red-300">Supprimer</button>
      </form>
    </div>
  );
}