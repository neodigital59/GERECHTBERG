"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";

interface AdminConfig {
  defaultLanguage: string;
  aiEnabled: boolean;
  aiProvider: "openai" | "anthropic" | "ollama" | "none";
  aiModel: string;
  temperature: number;
  translationEnabled: boolean;
}

const DEFAULTS: AdminConfig = {
  defaultLanguage: "fr",
  aiEnabled: true,
  aiProvider: "openai",
  aiModel: "gpt-4o-mini",
  temperature: 0.2,
  translationEnabled: true,
};

export default function AdminConfigurationPage() {
  const [cfg, setCfg] = useState<AdminConfig>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("admin_config") : null;
      if (raw) setCfg({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {/* ignore */}
  }, []);

  function save() {
    setSaving(true);
    try {
      window.localStorage.setItem("admin_config", JSON.stringify(cfg));
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setCfg(DEFAULTS);
    setSavedAt(null);
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="p-4 border-b">
            <div className="font-semibold">Langue par défaut</div>
            <div className="text-black/60 text-sm">Définit la langue initiale de l’interface et des documents</div>
          </div>
          <div className="p-4 flex items-center gap-4">
            <select
              value={cfg.defaultLanguage}
              onChange={(e)=>setCfg(c=>({ ...c, defaultLanguage: e.target.value }))}
              className="rounded border px-3 py-2"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="p-4 border-b">
            <div className="font-semibold">Paramètres IA</div>
            <div className="text-black/60 text-sm">Choisissez le fournisseur, le modèle et le comportement</div>
          </div>
          <div className="p-4 space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={cfg.aiEnabled} onChange={(e)=>setCfg(c=>({ ...c, aiEnabled: e.target.checked }))} />
              <span>Activer l’IA (rédaction, traduction, amélioration)</span>
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-black/60">Fournisseur</span>
                <select
                  value={cfg.aiProvider}
                  onChange={(e)=>setCfg(c=>({ ...c, aiProvider: e.target.value as AdminConfig["aiProvider"] }))}
                  className="rounded border px-3 py-2"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="ollama">Ollama (local)</option>
                  <option value="none">Aucun</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-black/60">Modèle</span>
                <input
                  value={cfg.aiModel}
                  onChange={(e)=>setCfg(c=>({ ...c, aiModel: e.target.value }))}
                  placeholder="ex: gpt-4o-mini / claude-3.5-sonnet / llama3.1"
                  className="rounded border px-3 py-2 w-72"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-black/60">Température</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={cfg.temperature}
                  onChange={(e)=>setCfg(c=>({ ...c, temperature: Number(e.target.value) }))}
                />
                <span className="w-12 text-sm text-black/70 text-right">{cfg.temperature.toFixed(2)}</span>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={cfg.translationEnabled} onChange={(e)=>setCfg(c=>({ ...c, translationEnabled: e.target.checked }))} />
                <span>Activer la traduction automatique</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-brand text-white disabled:opacity-60">{saving ? "Enregistrement…" : "Enregistrer"}</button>
          <button onClick={reset} className="px-4 py-2 rounded border">Réinitialiser</button>
          {savedAt && <span className="text-sm text-black/60">Sauvé à {savedAt}</span>}
        </div>

        <div className="text-xs text-black/50">
          Astuce: ces paramètres sont stockés localement (navigateur) pour la démo. Une version production peut persister en base (table `admin_config`).
        </div>
      </div>
    </RequireAuth>
  );
}