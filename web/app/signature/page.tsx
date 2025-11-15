export default function SignatureLandingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Signature électronique</h1>
        <p className="text-sm sm:text-base text-black/70 dark:text-white/70">Signez et horodatez vos documents en toute sécurité.</p>
      </header>
      <section className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-1">Traçabilité</h2>
          <p className="text-sm text-black/70">Horodatage des signatures et journal d’activité vérifiable.</p>
        </div>
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-1">Conformité</h2>
          <p className="text-sm text-black/70">Bonnes pratiques et conservation sécurisée des preuves.</p>
        </div>
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-1">Intégration</h2>
          <p className="text-sm text-black/70">Fonctionne avec vos documents existants et le partage.</p>
        </div>
      </section>
      <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <a href="/rendezvous" className="w-full sm:flex-1 bg-brand text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-brand/90">Planifier une démo</a>
        <a href="/documents/new" className="w-full sm:flex-1 border border-brand text-brand px-6 py-3 rounded-lg text-center font-medium hover:bg-brand/5">Voir mes documents</a>
      </section>
    </div>
  );
}