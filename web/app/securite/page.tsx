export default function SecuriteLandingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Sécurité & conformité</h1>
        <p className="text-sm sm:text-base text-black/70 dark:text-white/70">Protection des données, contrôle d’accès et audit.</p>
      </header>
      <section className="border rounded-xl bg-white p-4 shadow-sm">
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-black/80 dark:text-white/80">
          <li>Chiffrement des données en transit (TLS) et au repos.</li>
          <li>Journalisation complète des accès et opérations critiques.</li>
          <li>Politiques d’accès strictes et sessions sécurisées.</li>
          <li>Traçabilité des signatures et horodatage.</li>
          <li>Bonnes pratiques de confidentialité et minimisation des données.</li>
        </ul>
      </section>
      <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <a href="/rendezvous" className="w-full sm:flex-1 bg-brand text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-brand/90">Discuter sécurité</a>
        <a href="/contact" className="w-full sm:flex-1 border border-brand text-brand px-6 py-3 rounded-lg text-center font-medium hover:bg-brand/5">Nous contacter</a>
      </section>
    </div>
  );
}