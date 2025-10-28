"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function AuthStatus() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <span className="text-sm text-black/50 dark:text-white/60">Chargement…</span>;
  }

  if (!session) {
    return (
      <a href="/auth" className="text-sm rounded-full px-3 py-2 bg-brand text-white hover:bg-brand/80">
        Se connecter
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{session.user.email}</span>
      <button
        className="text-sm rounded-full px-3 py-2 border border-black/10 dark:border-white/15 hover:text-brand"
        onClick={async () => {
          await supabase.auth.signOut();
          location.href = "/";
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}