"use client";
import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth?next=${next}`;
          return;
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