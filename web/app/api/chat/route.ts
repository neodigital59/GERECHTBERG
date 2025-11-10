import { NextRequest } from "next/server";

// Proxy de streaming: lit le flux SSE du provider et renvoie uniquement le texte
function sseToTextStream(res: Response): ReadableStream<Uint8Array> {
  const reader = res.body!.getReader();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += new TextDecoder().decode(value, { stream: true });
      // Découper par lignes SSE
      const lines = buffer.split(/\r?\n/);
      // Garder la dernière ligne partielle en buffer
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") {
          controller.close();
          return;
        }
        try {
          const json = JSON.parse(data);
          // OpenAI / OpenRouter: delta.content
          const content = json?.choices?.[0]?.delta?.content ??
            json?.choices?.[0]?.message?.content ?? "";
          if (content) controller.enqueue(encoder.encode(content));
        } catch (_) {
          // Ignorer les paquets non JSON
        }
      }
    },
    cancel() {
      reader.cancel();
    }
  });
}

// Crée un flux texte simple (chunks) à partir d'une chaîne
function textToStream(text: string, chunk = 60, delayMs = 40): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = text.match(new RegExp(`.{1,${chunk}}`, "g")) || [text];
  return new ReadableStream<Uint8Array>({
    start(controller) {
      let i = 0;
      const push = () => {
        if (i >= chunks.length) { controller.close(); return; }
        controller.enqueue(encoder.encode(chunks[i++]));
        setTimeout(push, delayMs);
      };
      push();
    },
  });
}

export async function POST(req: NextRequest) {
  const { messages, locale, system } = await req.json();

  const apiKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const demoMode = process.env.DEMO_MODE === "true";
  const siteUrl = process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
  const appTitle = process.env.OPENROUTER_APP_TITLE || "GERECHTBERG";
  const orModel = process.env.OPENROUTER_MODEL || "openrouter/auto";
  const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

  // Validation minimale
  const msgs = Array.isArray(messages) ? messages : [];
  const hasUser = msgs.some((m) => m?.role === "user" && typeof m?.content === "string" && m.content.length > 0);
  if (!hasUser) {
    return new Response(JSON.stringify({ error: "Message utilisateur manquant" }), { status: 400 });
  }

  // Garde-fous: limiter aux fonctionnalités de l'app
  const lowerAllUserText = msgs
    .filter((m) => m?.role === "user" && typeof m?.content === "string")
    .map((m) => m.content)
    .join(" \n ");

  // Normaliser le texte: minuscules, sans accents, tirets->espaces, ponctuation nettoyée
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[-_]/g, " ")
      .replace(/[^a-z0-9\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  const text = normalize(lowerAllUserText);

  // Variantes des fonctionnalités indisponibles
  const notAvailablePatterns: RegExp[] = [
    /\bhorodatage\b/,
    /\btimestamp\b/,
    /\bsignature\s+numerique\b/,
    /\bsignature\s+electronique\b/,
  ];

  // Variantes des thèmes de l'app (documents, traduction, rendez-vous, paiement, paramètres, auth, etc.)
  const inScopePatterns: RegExp[] = [
    /\bdocument(s)?\b/,
    /\bnouveau\s+document\b/,
    /\bcreer\s+document\b/,
    /\btraduction\b|\btraduire\b/,
    /\brendez\s?-?\s?vous\b|\brdv\b|\brendezvous\b|\bappointment\b|\bmeeting\b|\bagenda\b|\bcalendrier\b/,
    /\bpaiement\b|\babonnement(s)?\b|\bsubscription\b|\bbilling\b/,
    /\bparametre(s)?\b|\bcompte\b|\bprofil\b|\bsettings\b/,
    /\bauthentification\b|\bconnexion\b|\binscription\b|\blogin\b|\bsign\s?in\b|\bsign\s?up\b/,
    /\bcontact\b/,
    /\bsecurite\b|\bconfidentialite\b/,
    /\badmin\b/,
    /\bmedia(s)?\b|\bediteur\b|\bedition\b/,
    /\bpage(s)?\b/,
  ];

  const matchesAny = (patterns: RegExp[], s: string) => patterns.some((re) => re.test(s));

  // Déterminer la langue choisie
  const lng = (typeof locale === "string" && locale) ? locale.toLowerCase().slice(0, 2) : "fr";

  const t = (key: "notAvailable" | "outOfScope"): string => {
    const map: Record<string, Record<string, string>> = {
      notAvailable: {
        fr: "Les fonctionnalités d’horodatage et de signature numérique ne sont pas encore disponibles dans GERECHTBERG. Elles arrivent bientôt. En attendant, vous pouvez créer des documents, traduire des contenus, prendre des rendez‑vous, gérer l’abonnement/paiement ou ajuster les paramètres du compte.",
        en: "Timestamping and digital signing are not yet available in GERECHTBERG. They’re coming soon. In the meantime, you can create documents, translate content, book appointments, manage payments/subscriptions, or adjust account settings.",
        de: "Zeitstempel und digitale Signatur sind in GERECHTBERG noch nicht verfügbar. Sie kommen bald. In der Zwischenzeit können Sie Dokumente erstellen, Inhalte übersetzen, Termine buchen, Zahlungen/Abonnements verwalten oder Kontoeinstellungen anpassen.",
        es: "El sellado de tiempo y la firma digital aún no están disponibles en GERECHTBERG. Llegarán pronto. Mientras tanto, puede crear documentos, traducir contenido, reservar citas, gestionar pagos/suscripciones o ajustar la configuración de la cuenta.",
        it: "La marcatura temporale e la firma digitale non sono ancora disponibili in GERECHTBERG. Arriveranno presto. Nel frattempo, puoi creare documenti, tradurre contenuti, prenotare appuntamenti, gestire pagamenti/abbonamenti o modificare le impostazioni dell’account.",
        pt: "Carimbo de data/hora e assinatura digital ainda não estão disponíveis no GERECHTBERG. Em breve. Enquanto isso, você pode criar documentos, traduzir conteúdos, agendar compromissos, gerenciar pagamentos/assinaturas ou ajustar as configurações da conta.",
        ru: "Функции отметки времени и электронной подписи в GERECHTBERG пока недоступны. Скоро появятся. А пока вы можете создавать документы, переводить контент, записываться на прием, управлять платежами/подписками или настраивать аккаунт.",
        tr: "Zaman damgası ve dijital imza GERECHTBERG’de henüz mevcut değil. Yakında gelecek. Bu arada, belgeler oluşturabilir, içerikleri çevirebilir, randevu alabilir, ödeme/abonelikleri yönetebilir veya hesap ayarlarını düzenleyebilirsiniz.",
        zh: "GERECHTBERG 中的时间戳和数字签名功能尚未开放。即将上线。期间你可以创建文档、翻译内容、预约、管理支付/订阅或调整账户设置。",
        ar: "ميزة الختم الزمني والتوقيع الرقمي غير متاحة بعد في GERECHTBERG. ستتوفر قريبًا. في هذه الأثناء، يمكنك إنشاء المستندات، ترجمة المحتوى، حجز المواعيد، إدارة الدفع/الاشتراكات أو تعديل إعدادات الحساب.",
        ja: "GERECHTBERGではタイムスタンプとデジタル署名はまだ利用できません。近日提供予定です。その間は、ドキュメントの作成・翻訳、予約、支払い/サブスクリプションの管理、アカウント設定の調整が可能です。",
      },
      outOfScope: {
        fr: "Je réponds uniquement aux fonctionnalités de l’app GERECHTBERG (création et gestion de documents, traduction, rendez‑vous, paiement/abonnements, paramètres de compte, authentification, sécurité/confidentialité). Dites‑moi ce que vous souhaitez faire dans l’app.",
        en: "I only answer about GERECHTBERG’s app features (document creation/management, translation, appointments, payments/subscriptions, account settings, authentication, security/privacy). Tell me what you want to do in the app.",
        de: "Ich antworte nur zu den Funktionen der GERECHTBERG‑App (Dokumenterstellung/‑verwaltung, Übersetzung, Termine, Zahlungen/Abonnements, Kontoeinstellungen, Authentifizierung, Sicherheit/Datenschutz). Sagen Sie mir, was Sie in der App tun möchten.",
        es: "Solo respondo sobre las funciones de la aplicación GERECHTBERG (creación/gestión de documentos, traducción, citas, pagos/suscripciones, configuración de cuenta, autenticación, seguridad/privacidad). Dígame qué desea hacer en la aplicación.",
        it: "Rispondo solo sulle funzionalità dell’app GERECHTBERG (creazione/gestione documenti, traduzione, appuntamenti, pagamenti/abbonamenti, impostazioni account, autenticazione, sicurezza/privacy). Dimmi cosa vuoi fare nell’app.",
        pt: "Respondo apenas sobre os recursos do aplicativo GERECHTBERG (criação/gestão de documentos, tradução, compromissos, pagamentos/assinaturas, configurações da conta, autenticação, segurança/privacidade). Diga-me o que você deseja fazer no app.",
        ru: "Я отвечаю только по функциям приложения GERECHTBERG (создание/управление документами, перевод, запись на прием, платежи/подписки, настройки аккаунта, аутентификация, безопасность/конфиденциальность). Скажите, что вы хотите сделать в приложении.",
        tr: "Yalnızca GERECHTBERG uygulama özellikleri hakkında yanıt veriyorum (belge oluşturma/yönetimi, çeviri, randevular, ödemeler/abonelikler, hesap ayarları, kimlik doğrulama, güvenlik/gizlilik). Uygulamada ne yapmak istediğinizi söyleyin.",
        zh: "我只回答与 GERECHTBERG 应用功能相关的问题（文档创建/管理、翻译、预约、支付/订阅、账户设置、认证、安全/隐私）。请告诉我你想在应用内做什么。",
        ar: "أجيب فقط عن ميزات تطبيق GERECHTBERG (إنشاء/إدارة المستندات، الترجمة، المواعيد، الدفع/الاشتراكات، إعدادات الحساب، المصادقة، الأمان/الخصوصية). أخبرني بما تريد فعله داخل التطبيق.",
        ja: "GERECHTBERGのアプリ機能に関する質問のみに回答します（ドキュメント作成/管理、翻訳、予約、支払い/サブスクリプション、アカウント設定、認証、セキュリティ/プライバシー）。アプリで何をしたいか教えてください。",
      },
    };
    const dict = map[key];
    return dict[lng] || dict.en;
  };

  if (matchesAny(notAvailablePatterns, text)) {
    const msg = t("notAvailable");
    return new Response(textToStream(msg), { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // Si on détecte un thème lié aux services de l'app, on laisse répondre normalement (pas de refus)
  const isInScope = matchesAny(inScopePatterns, text);
  if (!isInScope) {
    const msg = t("outOfScope");
    return new Response(textToStream(msg), { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // Mode démo ou absence de clés: streamer une réponse fictive
  if (demoMode || (!apiKey && !openaiKey)) {
    const sample = `Bonjour! Ceci est une réponse d’exemple en mode démo.\n\n` +
      `Je peux répondre à vos questions, aider à rédiger des documents, et vous guider sur la plateforme.\n` +
      `Activez OPENAI_API_KEY ou OPENROUTER_API_KEY pour des réponses réelles.`;
    const encoder = new TextEncoder();
    const chunks = sample.match(/.{1,60}/g) || [sample];
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let i = 0;
        const push = () => {
          if (i >= chunks.length) { controller.close(); return; }
          controller.enqueue(encoder.encode(chunks[i++]));
          setTimeout(push, 50);
        };
        push();
      },
    });
    return new Response(stream, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // Construire les messages finalisés (injection éventuelle de system prompt)
  const baseSystem =
    `Tu es l’assistant de GERECHTBERG. \n` +
    `- Réponds exclusivement aux questions sur l’utilisation et les services de l’application GERECHTBERG. \n` +
    `- Si une question sort du périmètre (connaissances générales, conseils hors produit), refuse poliment et réoriente vers les fonctionnalités de l’app. \n` +
    `- Les fonctionnalités d’horodatage et de signature numérique ne sont pas encore disponibles; si l’utilisateur demande ces fonctionnalités, indique qu’elles arrivent bientôt et propose des alternatives (documents, traduction, rendez‑vous, paiement/abonnements, paramètres). \n` +
    `- Format des réponses: texte simple uniquement. N’utilise pas de Markdown, pas d’astérisques, pas de gras/italique, pas d’émojis. \n` +
    `- Pour une procédure, utilise une liste numérotée simple: 1., 2., 3., avec une étape par ligne. \n` +
    `- Réfère aux menus/boutons tels qu’ils apparaissent dans l’app; tu peux les mettre entre guillemets si utile. \n` +
    `- Réponds dans la langue choisie (${lng}). Si le message de l’utilisateur est dans une autre langue, réponds dans cette langue. Sois concis et actionnable, avec des étapes claires et des références UI si utile.`;

  const mergedSystem = system ? `${baseSystem}\n\nContexte additionnel:\n${system}` : baseSystem;

  const finalMessages = [
    { role: "system", content: mergedSystem },
    ...msgs,
  ];

  let r: Response;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let url = "";
  const body: any = { messages: finalMessages, temperature: 0.2, stream: true };

  if (openaiKey) {
    headers["Authorization"] = `Bearer ${openaiKey}`;
    url = "https://api.openai.com/v1/chat/completions";
    body.model = openaiModel;
  } else {
    headers["Authorization"] = `Bearer ${apiKey!}`;
    headers["HTTP-Referer"] = siteUrl;
    headers["X-Title"] = appTitle;
    url = "https://openrouter.ai/api/v1/chat/completions";
    body.model = orModel;
  }

  r = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

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
          : "Service de chat indisponible. Consultez le détail et réessayez.";
      return new Response(
        JSON.stringify({ error: msg, reason, provider, detail: errText }),
        { status: 402 }
      );
    }
    return new Response(JSON.stringify({ error: errText || "Erreur du fournisseur IA", provider }), { status: r.status });
  }

  const stream = sseToTextStream(r);
  return new Response(stream, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}