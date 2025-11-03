"use client";
import { useTranslation } from 'react-i18next';
import RequireAuth from '@/components/RequireAuth';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PageContent from '@/components/PageContent';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseUtils';

type Profile = { id: string; email: string | null; name: string | null; country: string | null };

export default function SettingsPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, country')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled) {
        if (error) setMessage(error.message);
        else setProfile(data as Profile);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: profile.name, country: profile.country })
        .eq('id', profile.id);
      if (error) setMessage(error.message);
      else setMessage('Profil mis à jour');
    } finally {
      setSaving(false);
    }
  }
  return (
    <RequireAuth>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>
            <p className="text-sm text-black/70 dark:text-white/70">{t('settings.subtitle')}</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <section className="bg-white border rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-2">Profil</h2>
            {!profile ? (
              <p className="text-sm text-black/60">Chargement…</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium">
                      {profile.name || profile.email || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-black/60">{profile.email}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Nom complet</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={profile.name || ''}
                      placeholder="Votre nom"
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Pays</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={profile.country || ''}
                      placeholder="FR"
                      onChange={e => setProfile({ ...profile, country: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded bg-brand text-white hover:bg-brand/80 disabled:opacity-50"
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    Enregistrer
                  </button>
                  {message && <span className="text-sm text-black/60">{message}</span>}
                </div>
              </div>
            )}
          </section>
          <section className="bg-white border rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-2">{t('settings.language.title')}</h2>
            <p className="text-sm text-black/70 mb-3">{t('settings.language.description')}</p>
            <LanguageSwitcher />
          </section>
          <section className="bg-white border rounded-xl p-4 shadow-sm">
            <PageContent slug="parametres" />
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}