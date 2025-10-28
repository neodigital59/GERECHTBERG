import { NextResponse, NextRequest } from "next/server";

function cspForEnv(isProd: boolean): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supaOrigin = (() => {
    try { return new URL(supabaseUrl).origin; } catch { return ""; }
  })();
  const connectSrc = ["'self'", supaOrigin, "https://openrouter.ai", isProd ? null : "ws:"].filter(Boolean).join(" ");
  const imgSrc = "'self' data: https: blob:";
  const scriptSrc = isProd ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";
  const styleSrc = "'self' 'unsafe-inline'";
  const fontSrc = "'self' data:";
  const baseUri = "'self'";
  const formAction = "'self' https://checkout.stripe.com";
  const frameSrc = "'self' https://js.stripe.com https://checkout.stripe.com";

  const directives = [
    `default-src 'self'`,
    `base-uri ${baseUri}`,
    `connect-src ${connectSrc}`,
    `img-src ${imgSrc}`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `font-src ${fontSrc}`,
    `form-action ${formAction}`,
    `frame-src ${frameSrc}`,
    `upgrade-insecure-requests`,
  ];

  // En prod, empêcher l’embarquement (clickjacking). En dev, ne pas fixer frame-ancestors pour autoriser l’embed IDE.
  if (isProd) directives.push(`frame-ancestors 'none'`);

  return directives.join("; ");
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const isProd = process.env.NODE_ENV === "production";

  // Strict Security Headers
  res.headers.set("Content-Security-Policy", cspForEnv(isProd));
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  if (isProd) {
    res.headers.set("X-Frame-Options", "DENY");
  }
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  if (isProd) {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Ensure SSR/CSR language alignment by setting i18n cookie from Accept-Language when missing/invalid
  try {
    const supported = ["fr","en","de","ru","tr","zh","es","it","pt","ar","ja"] as const;
    const cookieLang = req.cookies.get("i18next")?.value;
    const hasCookie = cookieLang && supported.includes(cookieLang as any);
    if (!hasCookie) {
      const al = req.headers.get("accept-language") || "fr";
      const first = al.split(",")[0]?.trim() || "fr"; // e.g. ru-RU
      const primary = first.split("-")[0]?.toLowerCase() || "fr";
      const nextLang = supported.includes(primary as any) ? primary : "fr";
      res.cookies.set("i18next", nextLang, { maxAge: 31536000, path: "/" });
    }
  } catch {}

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};