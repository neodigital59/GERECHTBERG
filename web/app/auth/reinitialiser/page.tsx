"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseUtils";

function isPasswordStrong(pw: string) {
  return pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(() => setReady(true)).catch(() => setReady(true));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (confirm !== password) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }
    if (!isPasswordStrong(password)) {
      setMessage("Mot de passe non conforme (8+ caractères, minuscule, majuscule, chiffre, symbole)");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Service indisponible");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Mot de passe mis à jour. Vous pouvez vous connecter.");
      setTimeout(() => { window.location.href = "/auth"; }, 1200);
    } catch (err: any) {
      setMessage(err.message || "Lien de réinitialisation invalide ou expiré, veuillez recommencer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm mt-10">
      <h1 className="text-xl font-semibold mb-4">Réinitialiser le mot de passe</h1>
      {!ready ? (
        <p className="text-sm text-black/70">Chargement…</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <p className="text-xs text-black/60">8+ caractères, au moins une minuscule, majuscule, chiffre et symbole.</p>
          <button disabled={loading} className="w-full rounded bg-brand text-white py-2 hover:bg-brand/80">
            {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      )}
      {message && <p className="mt-3 text-sm text-black/70">{message}</p>}
      <p className="mt-4 text-sm">
        <a href="/auth" className="text-brand hover:underline">Retour à la connexion</a>
      </p>
    </div>
  );
}