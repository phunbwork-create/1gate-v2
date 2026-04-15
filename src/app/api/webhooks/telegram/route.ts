import { NextRequest, NextResponse } from "next/server";

// Telegram webhook for receiving bot updates
// Register webhook: https://api.telegram.org/bot{TOKEN}/setWebhook?url={APP_URL}/api/webhooks/telegram

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle /start command — return chat_id so users can configure their Telegram notifications
    if (body.message) {
      const { chat, text } = body.message;
      const chatId = chat.id;

      if (text === "/start" || text === "/chatid") {
        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ Chat ID của bạn là: <code>${chatId}</code>\n\nCopy ID này và điền vào mục cài đặt thông báo trong hệ thống 1Gate.`,
              parse_mode: "HTML",
            }),
          }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Telegram Webhook] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
