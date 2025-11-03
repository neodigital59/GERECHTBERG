"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabaseUtils";

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRedirectBase() {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env && /^https?:\/\//.test(env)) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!isEmailValid(email)) {
      setMessage("Email invalide");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Service indisponible");
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${getRedirectBase()}/auth/reinitialiser`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setMessage("Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.");
    } catch (err: any) {
      setMessage(err.message || "Impossible d’envoyer le lien, réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm mt-10">
      <h1 className="text-xl font-semibold mb-4">Mot de passe oublié</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <button disabled={loading} className="w-full rounded bg-brand text-white py-2 hover:bg-brand/80">
          {loading ? "Envoi…" : "Envoyer le lien de réinitialisation"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-black/70">{message}</p>}
      <p className="mt-4 text-sm">
        <a href="/auth" className="text-brand hover:underline">Retour à la connexion</a>
      </p>
    </div>
  );
}