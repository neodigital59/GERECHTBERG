import docusign from "docusign-esign";

export type EnvelopeRequest = {
  email: string;
  name: string;
  returnUrl?: string;
  base64Doc?: string; // optional demo document
  docName?: string;
  documentId?: string; // for traceability in Connect events
  embedded?: boolean; // whether to generate an embedded signing URL
  clientUserId?: string; // optional, used only for embedded signing
};

export function isDocuSignConfigured() {
  const key = process.env.DOCUSIGN_INTEGRATION_KEY;
  const userId = process.env.DOCUSIGN_USER_ID;
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const oauthBase = process.env.DOCUSIGN_OAUTH_BASE_URI;
  const privateKey = process.env.DOCUSIGN_PRIVATE_KEY;
  return Boolean(key && userId && accountId && oauthBase && privateKey && privateKey !== "YOUR_DOCUSIGN_PRIVATE_KEY");
}

export async function getApiClient(): Promise<{ apiClient: docusign.ApiClient; accessToken: string; accountId: string; } | null> {
  if (!isDocuSignConfigured()) return null;
  const integratorKey = process.env.DOCUSIGN_INTEGRATION_KEY!;
  const userId = process.env.DOCUSIGN_USER_ID!; // GUID of the user
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID!;
  const oauthBasePath = process.env.DOCUSIGN_OAUTH_BASE_URI!; // e.g. https://account-d.docusign.com
  const privateKey = Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY!, "base64");

  const apiClient = new docusign.ApiClient();
  apiClient.setOAuthBasePath(oauthBasePath.replace("https://", ""));

  const jwtLifeSec = 3600; // 1h
  const scopes = ["signature", "impersonation"]; // required scopes

  const results = await apiClient.requestJWTUserToken(
    integratorKey,
    userId,
    scopes,
    privateKey,
    jwtLifeSec
  );
  const accessToken = results.body.access_token;
  apiClient.addDefaultHeader("Authorization", `Bearer ${accessToken}`);
  return { apiClient, accessToken, accountId };
}

export async function createEnvelope(req: EnvelopeRequest): Promise<{ envelopeId?: string; redirectUrl?: string; demo?: boolean; error?: string; }>
{
  if (!isDocuSignConfigured()) {
    // Demo fallback: pretend envelope created
    return { envelopeId: `demo-${Date.now()}`, redirectUrl: req.returnUrl || "/documents", demo: true };
  }
  const client = await getApiClient();
  if (!client) return { error: "DocuSign non configuré" };

  const envelopesApi = new docusign.EnvelopesApi(client.apiClient);

  const docBase64 = req.base64Doc || Buffer.from("Demo document for signature.", "utf8").toString("base64");
  const document = new docusign.Document();
  document.documentBase64 = docBase64;
  document.name = req.docName || "Document";
  document.fileExtension = "txt"; // demo
  document.documentId = "1";

  const signer = new docusign.Signer();
  signer.email = req.email;
  signer.name = req.name;
  signer.recipientId = "1";
  signer.routingOrder = "1";
  if (req.embedded) {
    signer.clientUserId = req.clientUserId || "1"; // required for embedded signing on recipient
  }

  const signHere = new docusign.SignHere();
  signHere.documentId = "1";
  signHere.pageNumber = "1";
  signHere.recipientId = "1";
  signHere.xPosition = "100";
  signHere.yPosition = "100";

  const tabs = new docusign.Tabs();
  tabs.signHereTabs = [signHere];
  signer.tabs = tabs;

  const recipients = new docusign.Recipients();
  recipients.signers = [signer];

  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = "Veuillez signer";
  envelopeDefinition.documents = [document];
  envelopeDefinition.recipients = recipients;
  envelopeDefinition.status = "sent"; // immediately send

  // Add custom field to trace documentId in Connect webhook
  if (req.documentId) {
    const textCustomField = new docusign.TextCustomField();
    textCustomField.name = "document_id";
    textCustomField.value = String(req.documentId);
    textCustomField.show = "false";
    const customFields = new docusign.CustomFields();
    customFields.textCustomFields = [textCustomField];
    envelopeDefinition.customFields = customFields;
  }

  const results = await envelopesApi.createEnvelope(client.accountId, { envelopeDefinition });
  const envelopeId = results.envelopeId;

  // Embedded signing optional
  if (req.embedded && req.returnUrl) {
    const viewRequest = new docusign.RecipientViewRequest();
    viewRequest.returnUrl = req.returnUrl;
    viewRequest.authenticationMethod = "none";
    viewRequest.email = req.email;
    viewRequest.userName = req.name;
    viewRequest.clientUserId = signer.clientUserId!; // same as recipient
    const view = await envelopesApi.createRecipientView(client.accountId, envelopeId!, { recipientViewRequest: viewRequest });
    return { envelopeId, redirectUrl: view.url };
  }

  return { envelopeId };
}

export function verifyConnectSignature(rawBody: string, receivedSignature: string | undefined, connectSecret?: string): boolean {
  try {
    if (!receivedSignature || !connectSecret) return false;
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", connectSecret);
    hmac.update(rawBody, "utf8");
    const expected = hmac.digest("hex");
    // DocuSign header often provides base64; accept hex or base64 forms
    const b64 = Buffer.from(expected, "hex").toString("base64");
    return receivedSignature === expected || receivedSignature === b64;
  } catch {
    return false;
  }
}