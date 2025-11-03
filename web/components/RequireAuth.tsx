"use client";
import { useEffect, useState, ReactNode } from "react";
import { getSupabase } from "@/lib/supabaseUtils";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const supabase = getSupabase();
      if (!supabase) {
        // Environnement non configuré pour Supabase: autoriser l'accès en dev afin d'éviter un blocage
        if (!cancelled) {
          setAllowed(true);
          setChecking(false);
        }
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth?next=${next}`;
          return;
        }
        // Appel de synchronisation du profil (crée/maj public.users avec name/email)
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (token) {
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({}),
            });
          }
        } catch (_) {
          // ignore erreurs de sync silencieusement
        }
        if (!cancelled) setAllowed(true);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  if (checking) {
    return (
      <div className="p-4 text-center text-black/70">Vérification de votre session…</div>
    );
  }
  if (!allowed) {
    return (
      <div className="p-4 text-center">Redirection vers la connexion…</div>
    );
  }
  return <>{children}</>;
}