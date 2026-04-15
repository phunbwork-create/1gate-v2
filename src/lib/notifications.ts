import { prisma } from "@/lib/prisma";
import { sendEmail, buildNotificationEmail } from "@/lib/resend";
import { sendTelegramMessage, formatTelegramNotification } from "@/lib/telegram";
import type { NotificationType } from "@/generated/prisma";

// SSE: In-memory store of active connections per userId
const sseClients = new Map<string, ReadableStreamDefaultController>();

export function registerSSEClient(
  userId: string,
  controller: ReadableStreamDefaultController
) {
  sseClients.set(userId, controller);
}

export function unregisterSSEClient(userId: string) {
  sseClients.delete(userId);
}

export function pushSSEEvent(userId: string, data: object) {
  const controller = sseClients.get(userId);
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      sseClients.delete(userId);
    }
  }
}

// ─── Main Notification Service ────────────────────────────────────────────────

export interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export async function sendNotification(
  params: SendNotificationParams
): Promise<void> {
  const { userId, type, title, body, link } = params;

  // 1. Save to DB
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, link },
  });

  // 2. Push via SSE (web notification badge)
  pushSSEEvent(userId, {
    id: notification.id,
    type,
    title,
    body,
    link,
    createdAt: notification.createdAt,
  });

  // 3. Check user's notification channels
  const channel = await prisma.notificationChannel.findUnique({
    where: { userId },
    include: { user: { select: { email: true, name: true } } },
  });

  const promises: Promise<boolean>[] = [];

  // Email
  if (channel?.emailEnabled) {
    promises.push(
      sendEmail({
        to: channel.user.email,
        subject: title,
        html: buildNotificationEmail(title, body, link, channel.user.name),
      })
    );
  }

  // Telegram
  if (channel?.telegramEnabled && channel.telegramChatId) {
    promises.push(
      sendTelegramMessage({
        chatId: channel.telegramChatId,
        text: formatTelegramNotification(title, body, link),
      })
    );
  }

  // Fire all channels concurrently, don't block
  Promise.allSettled(promises).catch(console.error);
}

// Notify multiple users at once
export async function sendNotificationToMany(
  userIds: string[],
  params: Omit<SendNotificationParams, "userId">
): Promise<void> {
  await Promise.allSettled(
    userIds.map((userId) => sendNotification({ ...params, userId }))
  );
}
