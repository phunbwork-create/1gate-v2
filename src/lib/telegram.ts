const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: "HTML" | "Markdown";
}

export async function sendTelegramMessage({
  chatId,
  text,
  parseMode = "HTML",
}: TelegramMessage): Promise<boolean> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN not set, skipping");
    return false;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Telegram] Failed to send message:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Telegram] Error:", err);
    return false;
  }
}

export function formatTelegramNotification(
  title: string,
  body: string,
  link?: string
): string {
  let message = `<b>🔔 ${title}</b>\n\n${body}`;
  if (link) {
    message += `\n\n<a href="${process.env.NEXTAUTH_URL}${link}">Xem chi tiết →</a>`;
  }
  return message;
}
