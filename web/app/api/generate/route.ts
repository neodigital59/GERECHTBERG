import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { type, titre, langue, pays, ton, details } = await req.json();
  const apiKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const demoMode = process.env.DEMO_MODE === "true";
  const siteUrl = process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
  const appTitle = process.env.OPENROUTER_APP_TITLE || "GERECHTBERG";
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";
  const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey && !openaiKey && !demoMode) {
    return new Response(
      JSON.stringify({ error: "Aucune clé API disponible. Renseignez OPENAI_API_KEY ou OPENROUTER_API_KEY, ou activez DEMO_MODE=true pour un contenu d’exemple." }),
      { status: 400 }
    );
  }

  // Convertir code pays (FR) en nom en français si possible
  let paysNom = pays;
  try {
    const countries = await import("i18n-iso-countries");
    const fr = (await import("i18n-iso-countries/langs/fr.json")).default;
    countries.default.registerLocale(fr as any);
    const code = (pays || "").toUpperCase();
    const name = countries.default.getName(code, "fr");
    if (name) paysNom = name;
  } catch (_) {
    // si la lib n'est pas dispo, on garde la valeur fournie
  }

  const prompt = `Vous êtes un assistant juridique. Rédigez un ${type}${paysNom ? " pour le pays " + paysNom : ""}, en langue ${langue}${ton ? ", avec un ton " + ton : ""}. ${titre ? "Titre: " + titre + ". " : ""}${details ? "Détails spécifiques: " + details + ". " : ""}Inclure une structure claire et des clauses pertinentes.`;

  // Mode démo: retourner un contenu d'exemple sans appel externe
  if (demoMode) {
    const isCoverLetter = String(type || "").toLowerCase().includes("motivation");
    const isFrench = String(langue || "").toLowerCase().startsWith("fr");
    if (isCoverLetter && isFrench) {
      const org = /dgse/i.test(details || titre || "") ? "Direction Générale de la Sécurité Extérieure (DGSE)" : "votre organisme";
      const job = /drh/i.test(details || titre || "") ? "Directeur des Ressources Humaines (DRH)" : "poste ciblé";
      const today = new Date().toLocaleDateString("fr-FR");
      const complete = [
        "Nom Prénom",
        "Adresse complète",
        "Courriel — Téléphone",
        "",
        `À ${org}`,
        "Département des Ressources Humaines",
        "Adresse",
        "",
        `À ${paysNom || pays || "France"}, le ${today}`,
        "",
        `Objet : Candidature au poste de ${job}`,
        "",
        "Madame, Monsieur,",
        "",
        "Je vous adresse ma candidature pour le poste de Directeur des Ressources Humaines. Fort d’une expérience confirmée en management RH stratégique, en conformité réglementaire et en pilotage de la transformation, je souhaite mettre mes compétences au service d’une institution exigeante et sensible aux enjeux de souveraineté, de sécurité et d’exemplarité publique.",
        "",
        "Au cours de mes expériences, j’ai conduit des politiques RH alignées sur le droit du travail (Code du travail, Code civil), la protection des données (RGPD), et la sécurité des systèmes d’information (conformité eIDAS pour les processus de signature). J’ai mené des projets d’optimisation des processus, structuré le dialogue social, piloté le recrutement de profils rares et confidentiels, et instauré des cadres de gouvernance clairs (indicateurs, audits, gestion des risques).",
        "",
        "Ma capacité à encadrer des équipes pluridisciplinaires, à instaurer une culture d’éthique, de discrétion et de performance, ainsi qu’à accompagner la transformation organisationnelle, répond aux exigences d’un environnement où l’intégrité, la confidentialité et la rigueur opérationnelle sont déterminantes.",
        "",
        "Convaincu que des Ressources Humaines robustes sont un atout clé pour la continuité et la résilience, je m’engage à garantir un haut niveau de conformité (RGPD), une gestion responsable des données sensibles, et une politique de recrutement/progression équitable et transparente.",
        "",
        "Je serais honoré d’échanger avec vous afin de détailler mes réalisations et ma vision pour la fonction DRH. Vous trouverez ci‑joint mon curriculum vitae.",
        "",
        "Veuillez agréer, Madame, Monsieur, l’expression de ma considération distinguée.",
        "",
        "Signature",
      ].join("\n");
      return Response.json({ result: complete });
    }
    const sample = [
      `Titre: ${titre || type}`,
      `Pays: ${pays || "N/A"} — Langue: ${langue} — Ton: ${ton || "Neutre"}`,
      "",
      "En‑tête",
      "[Vos nom et coordonnées]",
      "[Date]",
      "[Destinataire]",
      "",
      "Objet",
      `${titre || `Rédaction de ${type}`}`,
      "",
      "Corps",
      `Ce document est rédigé pour ${pays || "le pays sélectionné"}. Il présente une structure claire et des mentions pertinentes.`,
      details ? `Détails fournis: ${details}` : "",
      "",
      "Clôture",
      "Veuillez agréer, [formule de politesse].",
    ].filter(Boolean).join("\n");
    return Response.json({ result: sample });
  }

  const chatMessages = [
    {
      role: "system",
      content: `Tu es **GERECHTBERG**, une intelligence juridique et rédactionnelle spécialisée dans la création de documents professionnels conformes au droit européen.
 
 🎯 **Mission principale**
 Tu rédiges des documents, contrats, lettres, attestations, formulaires et modèles administratifs adaptés à la législation et aux usages des pays membres de l’Union européenne, notamment :
 - 🇩🇪 Allemagne
 - 🇫🇷 France
 - 🇧🇪 Belgique
 - 🇮🇹 Italie
 - 🇵🇱 Pologne
 Et tout autre État membre de l’UE.
 
 ---
 
 ⚖️ **Normes et réglementations à respecter**
 1. Respecter le **RGPD (Règlement Général sur la Protection des Données)** pour tout traitement de données personnelles.
 2. Intégrer, le cas échéant, les mentions liées à **eIDAS** (signature électronique et documents numériques).
 3. Conformer les clauses à la **directive européenne 2011/83/UE** relative aux droits des consommateurs, si applicable.
 4. Employer un **langage juridique clair, précis, professionnel et conforme** aux usages administratifs européens.
 5. Toujours adapter les références juridiques, expressions et formules au **pays concerné** (ex. Code civil français, Bürgerliches Gesetzbuch en Allemagne, etc.).
 6. Aucune information ne doit contredire la législation de l’UE ou du pays concerné.
 7. Mentionner les **articles ou références légales** uniquement lorsque cela renforce la crédibilité du document (sans surcharge).
 8. Le texte doit être **directement exploitable** (aucune explication ou métadonnée visible).
 
 ---
 
 🧱 **Structure de réponse attendue**
 Tu produis **uniquement le texte final complet** du document demandé, selon la langue et le ton spécifiés.
 Ne jamais inclure :
 - D’introduction explicative
 - De balises techniques
 - De commentaires sur la rédaction
 
 Chaque document doit être :
 - Structuré (titre, corps, clôture)
 - Rédigé dans la langue du pays ciblé
 - Prêt à être copié-collé dans un format professionnel (.docx, .pdf, etc.)
 
 ---
 
 💼 **Style et ton**
 - Ton professionnel, neutre, administratif ou juridique selon le contexte.
 - Orthographe et syntaxe impeccables.
 - Adaptation culturelle et terminologique à chaque pays (ex. “Société à responsabilité limitée” en FR, “GmbH” en DE).
 
 ---
 
 🔒 **Rappel déontologique**
 Tu n’agis pas comme avocat, mais comme assistant de rédaction.
 Tes contenus sont générés à titre informatif et doivent toujours être vérifiés avant usage juridique officiel.
 Tu ne fournis aucun conseil juridique personnalisé ni interprétation de lois.
 
 ---
 
 🧠 **Objectif final**
 > Générer des documents européens conformes, professionnels, cohérents et immédiatement exploitables, dans le respect des lois et standards de l’Union européenne.`
    },
    {
      role: "user",
      content: `Données de rédaction:\n- Type: ${type}\n- Titre: ${titre || type}\n- Langue: ${langue}\n- Pays: ${paysNom || pays || "non précisé"}\n- Ton: ${ton || "Professionnel"}\n- Détails: ${details || "Aucun"}\n\nConsignes:\n- Respecter strictement les règles du message système.\n- Adapter au pays et au droit européen (RGPD/eIDAS).\n- Renvoie uniquement le texte final du document complet, sans introduction, balises ou explications.`
    },
  ];

  let r: Response;
  if (openaiKey) {
    r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: chatMessages,
        temperature: 0.3,
      }),
    });
  } else {
    r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrl,
        "X-Title": appTitle,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.3,
        stream: false,
      }),
    });
  }

  if (!r.ok) {
    const errText = await r.text();
    const provider = openaiKey ? "openai" : "openrouter";
    if (r.status === 402 && provider === "openrouter") {
      let reason: "insufficient_credits" | "invalid_key" | "unknown" = "insufficient_credits";
      try {
        const parsed = JSON.parse(errText);
        const s = JSON.stringify(parsed).toLowerCase();
        if (s.includes("invalid") && s.includes("key")) reason = "invalid_key";
        else if (s.includes("missing") && s.includes("key")) reason = "invalid_key";
        else if (s.includes("payment") || s.includes("credit")) reason = "insufficient_credits";
        else reason = "unknown";
      } catch (_) {
        const s = (errText || "").toLowerCase();
        if (s.includes("invalid") && s.includes("key")) reason = "invalid_key";
        else if (s.includes("missing") && s.includes("key")) reason = "invalid_key";
        else if (s.includes("payment") || s.includes("credit")) reason = "insufficient_credits";
        else reason = "unknown";
      }
      const msg = reason === "invalid_key"
        ? `Clé ${provider} invalide. Vérifiez la clé API.`
        : reason === "insufficient_credits"
          ? `Crédits ${provider} insuffisants. Ajoutez des crédits à votre compte.`
          : "Service de rédaction indisponible. Consultez le détail et réessayez.";
      return new Response(
        JSON.stringify({
          error: msg,
          reason,
          provider,
          detail: errText,
        }),
        { status: 402 }
      );
    }
    return new Response(JSON.stringify({ error: errText || "Erreur du fournisseur IA", provider }), { status: r.status });
  }
  const json = await r.json();
  const result = json?.choices?.[0]?.message?.content ?? "";
  return Response.json({ result });
}