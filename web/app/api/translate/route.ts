import { NextRequest } from "next/server";
import { buildTranslateMessages } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { text, target } = await req.json();
  // Résolution étendue des langues: accepte codes BCP-47 (ex: fr, en, de, zh-Hant, pt-BR)
  function resolveLanguageName(t: string | undefined): string {
    const raw = (t || "").trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();
    const special: Record<string, string> = {
      "zh": "Chinese",
      "zh-cn": "Chinese (Simplified)",
      "zh-hans": "Chinese (Simplified)",
      "zh-tw": "Chinese (Traditional)",
      "zh-hant": "Chinese (Traditional)",
      "pt": "Portuguese",
      "pt-br": "Portuguese (Brazil)",
      "pt-pt": "Portuguese (Portugal)",
      "sr": "Serbian",
      "sr-latn": "Serbian (Latin)",
      "sr-cyrl": "Serbian (Cyrillic)",
      "he": "Hebrew",
      "iw": "Hebrew",
      "jw": "Javanese",
    };
    if (special[lower]) return special[lower];
    try {
      // Utiliser Intl.DisplayNames pour la plupart des codes
      const dn = new Intl.DisplayNames(["en"], { type: "language" });
      const name = dn.of(lower);
      return (name || raw) as string;
    } catch {
      return raw;
    }
  }
  const resolvedTarget = resolveLanguageName(target);
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

  // Prompt est désormais construit via lib/prompts.ts

  // Mode démo: simple transformation pour montrer le flux
  if (demoMode) {
    const sample = `Traduction (${resolvedTarget} — démo):\n\n${text}`;
    return Response.json({ result: sample });
  }

  const messages = buildTranslateMessages({ text, target: resolvedTarget });

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
        messages,
        temperature: 0.2,
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
        messages,
        temperature: 0.2,
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
          : "Service de traduction indisponible. Consultez le détail et réessayez.";
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