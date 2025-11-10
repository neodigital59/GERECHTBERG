"use client";
import React from "react";
import i18n from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const assistantName = "Greta";

  function getNewChatLabel(): string {
    const raw = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr")) || "fr";
    const lng = raw.toLowerCase().slice(0, 2);
    const labels: Record<string, string> = {
      fr: "Nouvelle discussion",
      en: "New conversation",
      de: "Neue Unterhaltung",
      es: "Nueva conversación",
      it: "Nuova conversazione",
      pt: "Nova conversa",
      ru: "Новый диалог",
      tr: "Yeni sohbet",
      zh: "新会话",
      ar: "محادثة جديدة",
      ja: "新しい会話",
    };
    return labels[lng] || labels.en;
  }

  function getCloseLabel(): string {
    const raw = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr")) || "fr";
    const lng = raw.toLowerCase().slice(0, 2);
    const labels: Record<string, string> = {
      fr: "Fermer",
      en: "Close",
      de: "Schließen",
      es: "Cerrar",
      it: "Chiudi",
      pt: "Fechar",
      ru: "Закрыть",
      tr: "Kapat",
      zh: "关闭",
      ar: "إغلاق",
      ja: "閉じる",
    };
    return labels[lng] || labels.en;
  }

  function getSendLabel(): string {
    const raw = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr")) || "fr";
    const lng = raw.toLowerCase().slice(0, 2);
    const labels: Record<string, string> = {
      fr: "Envoyer",
      en: "Send",
      de: "Senden",
      es: "Enviar",
      it: "Invia",
      pt: "Enviar",
      ru: "Отправить",
      tr: "Gönder",
      zh: "发送",
      ar: "إرسال",
      ja: "送信",
    };
    return labels[lng] || labels.en;
  }

  function getPlaceholderText(): string {
    const raw = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr")) || "fr";
    const lng = raw.toLowerCase().slice(0, 2);
    const labels: Record<string, string> = {
      fr: "Écrire un message…",
      en: "Type a message…",
      de: "Nachricht schreiben…",
      es: "Escribe un mensaje…",
      it: "Scrivi un messaggio…",
      pt: "Escreva uma mensagem…",
      ru: "Напишите сообщение…",
      tr: "Bir mesaj yazın…",
      zh: "输入消息…",
      ar: "اكتب رسالة…",
      ja: "メッセージを入力…",
    };
    return labels[lng] || labels.en;
  }

  function getOpenChatAriaLabel(): string {
    const raw = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr")) || "fr";
    const lng = raw.toLowerCase().slice(0, 2);
    const labels: Record<string, string> = {
      fr: "Ouvrir le chat",
      en: "Open chat",
      de: "Chat öffnen",
      es: "Abrir chat",
      it: "Apri chat",
      pt: "Abrir chat",
      ru: "Открыть чат",
      tr: "Sohbeti aç",
      zh: "打开聊天",
      ar: "افتح الدردشة",
      ja: "チャットを開く",
    };
    return labels[lng] || labels.en;
  }

  function getLauncherLabel(): string {
    const raw = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr")) || "fr";
    const lng = raw.toLowerCase().slice(0, 2);
    const labels: Record<string, string> = {
      fr: "Chat",
      en: "Chat",
      de: "Chat",
      es: "Chat",
      it: "Chat",
      pt: "Chat",
      ru: "Чат",
      tr: "Sohbet",
      zh: "聊天",
      ar: "دردشة",
      ja: "チャット",
    };
    return labels[lng] || labels.en;
  }

  function getEmptyHintText(): string {
    const raw = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr")) || "fr";
    const lng = raw.toLowerCase().slice(0, 2);
    const labels: Record<string, string> = {
      fr: "Posez une question pour commencer.",
      en: "Ask a question to get started.",
      de: "Stellen Sie eine Frage, um zu beginnen.",
      es: "Haz una pregunta para comenzar.",
      it: "Fai una domanda per iniziare.",
      pt: "Faça uma pergunta para começar.",
      ru: "Задайте вопрос, чтобы начать.",
      tr: "Başlamak için bir soru sorun.",
      zh: "提一个问题以开始。",
      ar: "اطرح سؤالًا للبدء.",
      ja: "質問して開始してください。",
    };
    return labels[lng] || labels.en;
  }

  function getIntroText(): string {
    // Détecter langue via i18n si disponible, sinon navigateur
    const raw = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr")) || "fr";
    const lng = raw.toLowerCase().slice(0, 2);
    const texts: Record<string, string> = {
      fr: `Bonjour, je suis ${assistantName}, l’assistant de GERECHTBERG. Je vous aide à utiliser l’application: création et gestion de documents, traduction, rendez‑vous, paiement et abonnements, paramètres de compte, authentification, sécurité et confidentialité. Les fonctionnalités d’horodatage et de signature numérique ne sont pas encore disponibles; elles arrivent bientôt. Que souhaitez‑vous faire maintenant ?`,
      en: `Hello, I’m ${assistantName}, GERECHTBERG’s assistant. I help you use the app: document creation and management, translation, appointments, payments and subscriptions, account settings, authentication, security and privacy. Timestamping and digital signing are not available yet; coming soon. What would you like to do now?`,
      de: `Hallo, ich bin ${assistantName}, die Assistentin von GERECHTBERG. Ich helfe Ihnen bei der Nutzung der Anwendung: Dokumenterstellung und ‑verwaltung, Übersetzung, Termine, Zahlungen und Abonnements, Kontoeinstellungen, Authentifizierung, Sicherheit und Datenschutz. Zeitstempel und digitale Signatur sind noch nicht verfügbar; sie kommen bald. Was möchten Sie jetzt tun?`,
      es: `Hola, soy ${assistantName}, la asistente de GERECHTBERG. Te ayudo a usar la aplicación: creación y gestión de documentos, traducción, citas, pagos y suscripciones, configuración de cuenta, autenticación, seguridad y privacidad. El sellado de tiempo y la firma digital aún no están disponibles; llegarán pronto. ¿Qué quieres hacer ahora?`,
      it: `Ciao, sono ${assistantName}, l’assistente di GERECHTBERG. Ti aiuto a usare l’app: creazione e gestione dei documenti, traduzione, appuntamenti, pagamenti e abbonamenti, impostazioni dell’account, autenticazione, sicurezza e privacy. La marcatura temporale e la firma digitale non sono ancora disponibili; arriveranno presto. Cosa vuoi fare ora?`,
      pt: `Olá, sou ${assistantName}, assistente da GERECHTBERG. Ajudo você a usar o aplicativo: criação e gestão de documentos, tradução, agendamentos, pagamentos e assinaturas, configurações de conta, autenticação, segurança e privacidade. Carimbo de data/hora e assinatura digital ainda não estão disponíveis; em breve. O que você deseja fazer agora?`,
      ru: `Здравствуйте, я ${assistantName}, ассистент GERECHTBERG. Я помогу вам использовать приложение: создание и управление документами, перевод, записи на прием, платежи и подписки, настройки аккаунта, аутентификация, безопасность и конфиденциальность. Функции отметки времени и электронной подписи пока недоступны; скоро появятся. Что вы хотите сделать сейчас?`,
      tr: `Merhaba, ben ${assistantName}, GERECHTBERG’in asistanıyım. Uygulamayı kullanmanıza yardımcı olurum: belge oluşturma ve yönetimi, çeviri, randevular, ödemeler ve abonelikler, hesap ayarları, kimlik doğrulama, güvenlik ve gizlilik. Zaman damgası ve dijital imza henüz mevcut değil; yakında geliyor. Şimdi ne yapmak istersiniz?`,
      zh: `你好，我是 ${assistantName}，GERECHTBERG 的助手。我可以帮助你使用应用：创建和管理文档、翻译、预约、支付与订阅、账户设置、身份验证、安全与隐私。时间戳和数字签名功能暂不可用；即将上线。你现在想做什么？`,
      ar: `مرحبًا، أنا ${assistantName}، مساعِدة GERECHTBERG. أساعدك في استخدام التطبيق: إنشاء وإدارة المستندات، الترجمة، المواعيد، الدفع والاشتراكات، إعدادات الحساب، المصادقة، الأمان والخصوصية. ميزتا الختم الزمني والتوقيع الرقمي غير متاحتين بعد؛ ستتوفران قريبًا. ماذا تريد أن تفعل الآن؟`,
      ja: `こんにちは、私は${assistantName}、GERECHTBERGのアシスタントです。アプリの使い方をお手伝いします：ドキュメント作成・管理、翻訳、予約、支払い・サブスクリプション、アカウント設定、認証、セキュリティとプライバシー。タイムスタンプとデジタル署名はまだ利用できませんが、まもなく提供予定です。今、何をしたいですか？`,
    };
    return texts[lng] || texts.en;
  }

  // Message d'auto‑présentation affiché à la première ouverture du widget (une fois par session)
  React.useEffect(() => {
    if (!isOpen) return;
    if (messages.length === 0) {
      const intro = getIntroText();
      setMessages([{ role: "assistant", content: intro }]);
    }
  }, [isOpen, messages.length]);

  function closeChat() {
    setIsOpen(false);
    // Réinitialiser pour une "nouvelle discussion" à la prochaine ouverture
    setMessages([]);
    setInput("");
    setError(null);
    try {
      if (typeof window !== "undefined") sessionStorage.removeItem("gb_chat_greeted");
    } catch (_) {}
  }

  function newChat() {
    // Réinitialiser sans fermer; l'intro s'affichera car messages sera vide
    setMessages([]);
    setInput("");
    setError(null);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;
    setError(null);
    setIsLoading(true);
    setInput("");
    const toSend = [...messages, { role: "user", content: text }];
    // Ajouter placeholder assistant uniquement côté UI
    setMessages([...toSend, { role: "assistant", content: "" }]);
    const locale = (i18n?.language || (typeof navigator !== "undefined" ? navigator.language : "fr"))
      .toLowerCase()
      .slice(0, 2);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toSend, locale }),
      });
      if (!res.ok || !res.body) {
        const detail = await res.text();
        throw new Error(detail || "Chat API error");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          // Dernier message est l'assistant
          const idx = updated.length - 1;
          if (idx >= 0 && updated[idx].role === "assistant") {
            updated[idx] = { ...updated[idx], content: acc };
          }
          return updated;
        });
      }
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          className="rounded-full text-white px-4 py-2 shadow hover:opacity-90"
          style={{ backgroundColor: "var(--brand)" }}
          onClick={() => setIsOpen(true)}
          aria-label={getOpenChatAriaLabel()}
        >
          {getLauncherLabel()}
        </button>
      )}
      {isOpen && (
        <div className="w-[360px] max-w-[90vw] h-[520px] flex flex-col rounded-lg border border-gray-300 bg-white shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="font-semibold" style={{ color: "var(--foreground)" }}>{assistantName}</div>
            <button className="text-gray-500 hover:text-gray-700" onClick={closeChat} aria-label={getCloseLabel()}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-gray-500">{getEmptyHintText()}</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === "user" ? "text-gray-900" : "text-gray-800"}`}>
                <div
                  className={`inline-block px-3 py-2 rounded-lg whitespace-pre-wrap ${m.role === "user" ? "bg-gray-100" : ""}`}
                  style={m.role === "assistant" ? { backgroundColor: "var(--bg-start)", border: "1px solid var(--brand)" } : undefined}
                >
                  {m.content || (m.role === "assistant" ? (isLoading ? "…" : "") : "")}
                </div>
              </div>
            ))}
            {error && <div className="text-xs text-red-600">{error}</div>}
          </div>
          <div className="border-t p-2">
            <textarea
              className="w-full resize-none border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ color: "var(--foreground)" }}
              rows={3}
              placeholder={getPlaceholderText()}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                onClick={newChat}
              >
                {getNewChatLabel()}
              </button>
              <button
                className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                onClick={closeChat}
              >
                {getCloseLabel()}
              </button>
              <button
                className="rounded text-white px-3 py-1 text-sm hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--brand)" }}
                onClick={sendMessage}
                disabled={isLoading}
              >
                {getSendLabel()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}