"use client";
import OneCalEmbed from "@/components/OneCalEmbed";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseUtils";

export default function ConfirmationPage() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const apptId = (params.get("appointmentId") || "").trim();
  const [checking, setChecking] = useState(true);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  async function verify() {
    setChecking(true);
    setError(null);
    try {
      const supabase = getSupabase();
      let headers: Record<string,string> = { "Content-Type": "application/json" };
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers,
        body: JSON.stringify({ appointmentId: apptId || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur vérification");
      setPaid(Boolean(json.paid));
      setReceiptUrl(json.receipt_url || null);
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apptId]);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
        <div className="text-lg font-medium mb-2">✅ {t("appointments.confirmation.successTitle")}</div>
        <p className="text-sm text-black/70 mb-4">{t("appointments.confirmation.next")}</p>
        {checking && (<p className="text-sm text-black/60">Vérification du paiement…</p>)}
        {error && (<p className="text-sm text-red-600">{error}</p>)}
        {!checking && !paid && !error && (
          <div className="text-sm text-black/70 mb-2">Paiement non détecté pour ce rendez-vous. Merci de réessayer après votre paiement.</div>
        )}
        {receiptUrl && (
          <div className="text-sm mb-2">Reçu: <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="underline">ouvrir</a></div>
        )}
        <div className="flex gap-2">
          <Link href="/rendezvous" className="px-4 py-2 rounded border">{t("appointments.backToApp")}</Link>
          {!paid && (
            <button onClick={verify} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Re-vérifier</button>
          )}
        </div>
      </div>
      {/* Afficher OneCal uniquement après paiement confirmé */}
      {paid ? (
        <OneCalEmbed />
      ) : (
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <div className="text-sm text-black/70">Le module OneCal s’affichera après confirmation de votre paiement.</div>
        </div>
      )}
    </div>
  );
}