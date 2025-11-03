"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSupabase } from "@/lib/supabaseUtils";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";

export default function AuthStatus() {
  const { t } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

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
      <Link href="/auth" className="text-sm rounded-full px-3 py-2 bg-brand text-white hover:bg-brand/80">
        {t('auth.sign_in')}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">
        {(
          (session.user.user_metadata as any)?.full_name ||
          (session.user.user_metadata as any)?.name ||
          ([
            (session.user.user_metadata as any)?.first_name,
            (session.user.user_metadata as any)?.last_name,
          ]
            .filter(Boolean)
            .join(" ")) ||
          session.user.email
        )}
      </span>
      <button
        className="text-sm rounded-full px-3 py-2 border border-black/10 dark:border-white/15 hover:text-brand"
        onClick={async () => {
          const supabase = getSupabase();
          if (supabase) {
            await supabase.auth.signOut();
          }
          location.href = "/";
        }}
      >
        {t('auth.log_out')}
      </button>
    </div>
  );
}