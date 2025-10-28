import { NextRequest } from "next/server";
import docusign from "docusign-esign";
import { isDocuSignConfigured, getApiClient } from "@/lib/docusign";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(ip, "docusign-status", 20, 60_000);
  if (!rl.allowed) {
    return Response.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    const configured = isDocuSignConfigured();
    if (!configured) {
      return Response.json({ configured: false, error: "DocuSign non configuré" }, { status: 200 });
    }

    const client = await getApiClient();
    if (!client) {
      return Response.json({ configured: true, error: "Impossible d’obtenir un token JWT" }, { status: 500 });
    }

    // Récupérer les infos de l’utilisateur et du compte via SDK
    const userInfo = await client.apiClient.getUserInfo(client.accessToken);
    const defaultAccount = userInfo?.accounts?.find((a: any) => a.isDefault) || userInfo?.accounts?.[0];

    // Préparer base path pour appels REST (pour référence)
    let restApiBasePath: string | undefined = undefined;
    if (defaultAccount?.baseUri) {
      restApiBasePath = `${defaultAccount.baseUri}/restapi`;
    }

    return Response.json({
      configured: true,
      oauthBaseUri: process.env.DOCUSIGN_OAUTH_BASE_URI,
      accountId: client.accountId,
      user: {
        name: userInfo?.name,
        email: userInfo?.email,
      },
      account: {
        name: defaultAccount?.accountName,
        accountId: defaultAccount?.accountId,
        baseUri: defaultAccount?.baseUri,
        restApiBasePath,
      },
      sdk: "docusign-esign",
    });
  } catch (e: any) {
    return Response.json({ configured: isDocuSignConfigured(), error: e?.message || "Erreur statut DocuSign" }, { status: 500 });
  }
}