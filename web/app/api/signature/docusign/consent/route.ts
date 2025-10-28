import { NextRequest } from "next/server";
import { isDocuSignConfigured } from "@/lib/docusign";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(ip, "docusign-consent", 20, 60_000);
  if (!rl.allowed) {
    return Response.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    if (!isDocuSignConfigured()) {
      return Response.json({ configured: false, error: "DocuSign non configuré" }, { status: 200 });
    }
    const url = new URL(req.url);
    const redirectParam = url.searchParams.get("redirectUri");
    const oauthBase = process.env.DOCUSIGN_OAUTH_BASE_URI as string;
    const clientId = process.env.DOCUSIGN_INTEGRATION_KEY as string;
    const defaultRedirect = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/";
    const redirectUri = redirectParam || defaultRedirect;
    const scopes = encodeURIComponent("signature impersonation");

    // URL standard d’autorisation OAuth pour obtenir le consentement utilisateur aux scopes JWT
    const consentUrl = `${oauthBase}/oauth/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return Response.json({ configured: true, consentUrl });
  } catch (e: any) {
    return Response.json({ configured: isDocuSignConfigured(), error: e?.message || "Erreur génération URL consent" }, { status: 500 });
  }
}