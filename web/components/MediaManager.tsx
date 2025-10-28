"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  onPickUrl?: (url: string) => void;
};

export default function MediaManager({ onPickUrl }: Props) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.storage.from("media").list(undefined, { limit: 100 });
      if (error) throw error;
      const names = (data || []).map(f => f.name);
      setFiles(names);
    } catch (e: any) {
      setError(e?.message || "Chargement des médias échoué");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const name = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("media").upload(name, file, { upsert: false });
      if (error) throw error;
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Upload échoué");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  async function remove(name: string) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.storage.from("media").remove([name]);
      if (error) throw error;
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Suppression échouée");
    } finally {
      setLoading(false);
    }
  }

  function publicUrl(name: string): string {
    const { data } = supabase.storage.from("media").getPublicUrl(name);
    return data.publicUrl;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input type="file" accept="image/*,video/*" onChange={onUpload} />
        <button className="px-3 py-2 rounded border" onClick={refresh}>Rafraîchir</button>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(3)].map((_, i) => (<div key={i} className="h-8 bg-black/5 rounded" />))}
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-black/60">Aucun média pour le moment.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {files.map(name => {
            const url = publicUrl(name);
            return (
              <li key={name} className="border rounded p-3 bg-white">
                <div className="text-sm truncate" title={name}>{name}</div>
                <div className="text-xs text-black/50 truncate" title={url}>{url}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={url} className="px-3 py-1 rounded border text-sm hover:text-brand" target="_blank" rel="noopener noreferrer">Ouvrir</a>
                  {onPickUrl && <button className="px-3 py-1 rounded border text-sm" onClick={() => onPickUrl(url)}>Insérer</button>}
                  <button className="px-3 py-1 rounded border text-sm text-red-700" onClick={() => remove(name)}>Supprimer</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-black/50">Astuce: créez un bucket Supabase nommé "media" et activez l'accès public pour obtenir des URLs publiques.</p>
    </div>
  );
}