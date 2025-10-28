import { createPage } from "../actions";

export default function NewPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Créer une nouvelle page</h2>
      <form action={createPage} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Titre</label>
          <input name="title" type="text" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Slug</label>
          <input name="slug" type="text" placeholder="ex: a-propos" className="w-full border rounded px-3 py-2" required />
          <p className="text-xs text-black/60 mt-1">URL publique: /&lt;slug&gt;</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Contenu (HTML)</label>
          <textarea name="content" rows={10} className="w-full border rounded px-3 py-2" placeholder="&lt;h1&gt;Titre&lt;/h1&gt;\n&lt;p&gt;Votre contenu HTML ici...&lt;/p&gt;"></textarea>
          <p className="text-xs text-black/60 mt-1">Pour un MVP rapide, le contenu est en HTML. On pourra passer à Markdown plus tard.</p>
        </div>
        <div className="flex items-center gap-2">
          <input id="published" name="published" type="checkbox" className="border rounded" />
          <label htmlFor="published" className="text-sm">Publier immédiatement</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 rounded bg-brand text-white">Créer</button>
          <a href="/admin/pages" className="px-3 py-2 rounded border">Annuler</a>
        </div>
      </form>
    </div>
  );
}