"use client";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
// remove: import CountrySelect from "@/components/CountrySelect";
import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";

try {
  countries.registerLocale(fr as any);
} catch (_) {}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000);
}

async function ensureTrialProfile(userId: string, email: string, name?: string | null, country?: string | null) {
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("users").insert({
      id: userId,
      email,
      role: "user",
      plan: "trial",
      trial_start: new Date().toISOString(),
      trial_end: addDays(new Date(), 7).toISOString(),
      name: name || null,
      country: country || null,
    });
  }
}

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isPasswordStrong(pw: string) {
  return pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}
function isNameValid(name: string) {
  const n = name.trim();
  return n.length >= 2 && n.length <= 100;
}

export default function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [accept, setAccept] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const nextUrl = useMemo(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get("next") || "/";
    } catch {
      return "/";
    }
  }, []);

  useEffect(() => {
    // Si déjà connecté (retour OAuth), redirige vers next
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;
      try { await ensureTrialProfile(user.id, user.email || "", name || null, country || null); } catch {}
      const storedNext = localStorage.getItem("post_auth_next");
      const target = nextUrl || storedNext || "/";
      try { localStorage.removeItem("post_auth_next"); } catch {}
      if (target && target !== window.location.pathname) {
        window.location.href = target;
      }
    });
  }, [nextUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        // Client-side validation prior to server request
        if (passwordConfirm !== password) throw new Error("Les mots de passe ne correspondent pas");
        if (!isNameValid(name)) throw new Error("Nom invalide (2–100 caractères)");
        if (!isEmailValid(email)) throw new Error("Email invalide");
        if (!isPasswordStrong(password)) throw new Error("Mot de passe non conforme (8+ caractères, minuscule, majuscule, chiffre, symbole)");
        if (!country || !/^[A-Za-z]{2}$/.test(country)) throw new Error("Veuillez sélectionner un pays valide");
        if (!accept) throw new Error("Veuillez accepter les conditions d’utilisation");

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, passwordConfirm, country, accept }),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error || "Inscription impossible");
        setMessage(out.message || "Inscription initiée. Vérifiez votre email.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          await ensureTrialProfile(data.user.id, email, name || null, country || null);
        }
        setMessage("Connexion réussie.");
        location.href = nextUrl || "/";
      }
    } catch (err: any) {
      setMessage(err.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    const target = nextUrl || "/";
    try { localStorage.setItem("post_auth_next", target); } catch {}
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.origin },
    });
    if (error) setMessage(error.message);
  }

  const countryOptions = useMemo(() => {
    const names = countries.getNames("fr");
    const entries = Object.entries(names).map(([code, name]) => ({ code, name }));
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm mt-10">
      <h1 className="text-xl font-semibold mb-4">
        {mode === "signup" ? "Créer un compte" : "Se connecter"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <label className="flex flex-col text-sm">
              Pays
              <select
                value={country ?? ""}
                onChange={(e) => setCountry(e.target.value || null)}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="" disabled>
                  Sélectionner un pays
                </option>
                {countryOptions.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.name} ({o.code})
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            aria-describedby="pw-help"
          />
          {mode === "signup" && (
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          )}
          {mode === "signup" && (
            <p id="pw-help" className="text-xs text-black/60 mt-1">
              8+ caractères, au moins une minuscule, majuscule, chiffre et symbole.
            </p>
          )}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs text-black/60 hover:text-black border rounded px-2 py-1"
            >
              {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            </button>
            {mode === "signup" && (
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-xs text-black/60 hover:text-black border rounded px-2 py-1"
              >
                {showConfirm ? "Masquer la confirmation" : "Afficher la confirmation"}
              </button>
            )}
          </div>
        </div>
        {mode === "signup" && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
            J’accepte les conditions d’utilisation
          </label>
        )}
        <button
          disabled={loading}
          className="w-full rounded bg-brand text-white py-2 hover:bg-brand/80"
        >
          {loading ? "Patientez…" : mode === "signup" ? t('auth.sign_up') : t('auth.sign_in')}
        </button>
      </form>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full flex items-center justify-center gap-2 rounded py-2 px-3 bg-white text-black border hover:bg-gray-50"
          aria-label={t('auth.continue_with_google')}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.23 1.25-1.55 3.6-5.1 3.6-3.08 0-5.6-2.52-5.6-5.6s2.52-5.6 5.6-5.6c1.48 0 2.52.5 3.44 1.2l2.36-2.36C15.83 3.1 14.05 2.4 12 2.4 6.98 2.4 2.9 6.48 2.9 11.5S6.98 20.6 12 20.6c5.38 0 8.9-3.76 8.9-9.3 0-.56-.06-1.02-.14-1.46H12z"/>
            <path fill="#34A853" d="M3.7 7.5l3 2.2C7.6 7.1 9.62 5.9 12 5.9c1.48 0 2.52.5 3.44 1.2l2.36-2.36C16.83 3.1 15.05 2.4 13 2.4 8.9 2.4 5.4 4.9 3.7 7.5z"/>
            <path fill="#FBBC05" d="M20.9 11.3c0-.5-.06-1.02-.14-1.46H12v3.6h5.1c-.23 1.25-1.55 3.6-5.1 3.6 2.16 1.61 5.33 1.53 7.41-.26 1.07-1.02 1.49-2.42 1.49-5.48z"/>
            <path fill="#4285F4" d="M6.7 14.9l-2.7 2c2 2.88 5.38 4.3 8 3.7 2.49-.56 4.65-2.38 5.1-4.7H12v-3.6H6.7c-.35 1.1-.33 2.38 0 2.6z"/>
          </svg>
          <span>{t('auth.continue_with_google')}</span>
        </button>
      </div>
      <p className="mt-4 text-sm">
        {mode === "signup" ? (
          <>
            Déjà inscrit ?
            <button
              className="ml-1 text-brand hover:underline"
              onClick={() => setMode("signin")}
            >
              {t('auth.sign_in')}
            </button>
          </>
        ) : (
          <>
            Nouveau ici ?
            <button
              className="ml-1 text-brand hover:underline"
              onClick={() => setMode("signup")}
            >
              {t('auth.sign_up')}
            </button>
          </>
        )}
      </p>
      {message && (
        <p className="mt-3 text-sm text-black/70">{message}</p>
      )}
    </div>
  );
}