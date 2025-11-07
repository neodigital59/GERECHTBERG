'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import PageContent from '@/components/PageContent';

export default function ContactPage() {
  const { t } = useTranslation();
  const supportValue = t('contact.support.email');
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportValue);
  const supportHref = isEmail ? `mailto:${supportValue}` : (supportValue.startsWith('http') ? supportValue : `https://${supportValue}`);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !email || !msg) return setError(t('contact.errors.required'));
    if (!emailOk) return setError(t('contact.errors.invalidEmail'));
    if (msg.length < 10) return setError(t('contact.errors.tooShort'));

    try {
      setLoading(true);
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: msg }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || t('contact.errors.sendFailed'));
      setSuccess(t('contact.success'));
      setName('');
      setEmail('');
      setMsg('');
    } catch (e: any) {
      setError(e?.message || t('contact.errors.unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8" suppressHydrationWarning>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('contact.title')}</h1>
        <p className="text-sm text-black/70 dark:text-white/70">{t('contact.subtitle')}</p>
      </header>

      <section className="max-w-md">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-medium mb-1">{t('contact.support.title')}</h2>
          <p className="text-sm text-black/70">{t('contact.support.description')}</p>
          <a href={supportHref} target={!isEmail ? '_blank' : undefined} rel={!isEmail ? 'noopener noreferrer' : undefined} className="inline-block mt-3 px-3 py-2 border rounded hover:text-brand w-full sm:w-auto">{supportValue}</a>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t('contact.form.title')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col text-sm">{t('contact.form.labels.name')}
            <input className="border rounded px-2 py-2 text-sm sm:text-base" placeholder={t('contact.form.placeholders.name')} value={name} onChange={(e)=>setName(e.target.value)} />
          </label>
          <label className="flex flex-col text-sm">{t('contact.form.labels.email')}
            <input type="email" className="border rounded px-2 py-2 text-sm sm:text-base" placeholder={t('contact.form.placeholders.email')} value={email} onChange={(e)=>setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col text-sm sm:col-span-2">{t('contact.form.labels.message')}
            <textarea className="border rounded px-2 py-2 h-32 text-sm sm:text-base" placeholder={t('contact.form.placeholders.message')} value={msg} onChange={(e)=>setMsg(e.target.value)} />
          </label>
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button type="submit" disabled={loading} className="w-full sm:w-auto rounded px-4 py-2 bg-brand text-white hover:bg-brand/80 disabled:opacity-50">{loading ? t('contact.form.sending') : t('contact.form.submit')}</button>
            {error && <span className="text-sm text-red-600 sm:ml-2">{error}</span>}
            {success && <span className="text-sm text-green-700 sm:ml-2">{success}</span>}
          </div>
        </form>
        <p className="text-xs text-black/50">{t('contact.note')}</p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/tarifs" className="w-full sm:w-auto rounded px-4 py-2 border hover:text-brand">{t('contact.links.pricing')}</Link>
        <Link href="/decouvert" className="w-full sm:w-auto rounded px-4 py-2 border hover:text-brand">{t('contact.links.discover')}</Link>
        <Link href="/documents" className="w-full sm:w-auto rounded px-4 py-2 bg-brand text-white hover:bg-brand/80">{t('contact.links.dashboard')}</Link>
      </section>

      <section className="mt-8">
        <PageContent slug="contact" />
      </section>
    </div>
  );
}