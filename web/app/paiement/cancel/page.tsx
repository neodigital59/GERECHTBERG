import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-semibold">Paiement annulé ❌</h1>
      <p className="mt-3">Votre paiement a été annulé. Vous pouvez réessayer quand vous voulez.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/tarifs" className="px-4 py-2 bg-brand text-white rounded">Revenir aux tarifs</Link>
        <Link href="/" className="px-4 py-2 border rounded">Accueil</Link>
      </div>
    </div>
  );
}