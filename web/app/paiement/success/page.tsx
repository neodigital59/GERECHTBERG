export default function SuccessPage() {
  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-semibold">Paiement réussi ✅</h1>
      <p className="mt-3">Votre abonnement est actif. Merci !</p>
      <div className="mt-6 flex gap-3">
        <a href="/documents" className="px-4 py-2 bg-brand text-white rounded">Aller au tableau de bord</a>
        <a href="/tarifs" className="px-4 py-2 border rounded">Voir les tarifs</a>
      </div>
    </div>
  );
}