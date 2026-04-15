import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@1gate.app";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set, skipping");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Email] Error:", err);
    return false;
  }
}

export function buildNotificationEmail(
  title: string,
  body: string,
  link?: string,
  recipientName?: string
): string {
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const actionButton = link
    ? `<a href="${appUrl}${link}" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-top:16px;">Xem chi tiết →</a>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:32px 0;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <div style="margin-bottom:24px;">
      <span style="font-size:24px;font-weight:700;color:#0f172a;">1Gate</span>
    </div>
    <h2 style="color:#0f172a;margin:0 0 12px;">${title}</h2>
    ${recipientName ? `<p style="color:#64748b;margin:0 0 16px;">Xin chào <strong>${recipientName}</strong>,</p>` : ""}
    <p style="color:#475569;line-height:1.6;margin:0 0 24px;">${body}</p>
    ${actionButton}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">
      Email này được gửi tự động từ hệ thống 1Gate. Vui lòng không trả lời email này.
    </p>
  </div>
</body>
</html>
  `.trim();
}
