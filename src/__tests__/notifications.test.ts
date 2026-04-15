/**
 * Tests: Notification Service
 *
 * Strategy:
 * - Mock prisma, resend, telegram (unit tests)
 * - Test: notification saved to DB, SSE pushed, email/telegram called conditionally
 * - Test data: user with all channels on, user with only web, user with telegram
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      create: jest.fn(),
    },
    notificationChannel: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/resend", () => ({
  sendEmail: jest.fn(),
  buildNotificationEmail: jest.fn().mockReturnValue("<html>email</html>"),
}));

jest.mock("@/lib/telegram", () => ({
  sendTelegramMessage: jest.fn(),
  formatTelegramNotification: jest.fn().mockReturnValue("telegram message"),
}));

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { sendTelegramMessage } from "@/lib/telegram";

const mockNotificationCreate = prisma.notification.create as jest.Mock;
const mockChannelFindUnique = prisma.notificationChannel.findUnique as jest.Mock;
const mockSendEmail = sendEmail as jest.Mock;
const mockSendTelegram = sendTelegramMessage as jest.Mock;

const mockNotification = {
  id: "notif-1",
  type: "APPROVAL" as const,
  title: "Đề xuất được duyệt",
  body: "Đề xuất thanh toán #ĐNTT-001 đã được phê duyệt",
  link: "/payment/1",
  createdAt: new Date(),
};

// ── Notification Creation ─────────────────────────────────────────────────────

describe("sendNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationCreate.mockResolvedValue(mockNotification);
  });

  it("saves notification to database", async () => {
    mockChannelFindUnique.mockResolvedValue(null);

    const { sendNotification } = await import("@/lib/notifications");
    await sendNotification({
      userId: "user-1",
      type: "APPROVAL",
      title: mockNotification.title,
      body: mockNotification.body,
      link: mockNotification.link,
    });

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        type: "APPROVAL",
        title: mockNotification.title,
        body: mockNotification.body,
        link: mockNotification.link,
      },
    });
  });

  it("sends email when emailEnabled is true", async () => {
    mockChannelFindUnique.mockResolvedValue({
      emailEnabled: true,
      telegramEnabled: false,
      telegramChatId: null,
      webEnabled: true,
      user: { email: "ketoan@ctm.vn", name: "Kế Toán" },
    });
    mockSendEmail.mockResolvedValue(true);

    const { sendNotification } = await import("@/lib/notifications");
    await sendNotification({
      userId: "user-1",
      type: "APPROVAL",
      title: mockNotification.title,
      body: mockNotification.body,
    });

    // Allow async channel notifications to settle
    await new Promise((r) => setTimeout(r, 50));
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  it("sends telegram when telegramEnabled is true and chatId exists", async () => {
    mockChannelFindUnique.mockResolvedValue({
      emailEnabled: false,
      telegramEnabled: true,
      telegramChatId: "123456789",
      webEnabled: true,
      user: { email: "user@ctm.vn", name: "Test User" },
    });
    mockSendTelegram.mockResolvedValue(true);

    const { sendNotification } = await import("@/lib/notifications");
    await sendNotification({
      userId: "user-1",
      type: "SUBMISSION",
      title: "Đề xuất mới cần duyệt",
      body: "Có đề xuất mới từ Nhân viên A",
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockSendTelegram).toHaveBeenCalledTimes(1);
    expect(mockSendTelegram).toHaveBeenCalledWith(
      expect.objectContaining({ chatId: "123456789" })
    );
  });

  it("does NOT send telegram when telegramEnabled but no chatId", async () => {
    mockChannelFindUnique.mockResolvedValue({
      emailEnabled: false,
      telegramEnabled: true,
      telegramChatId: null, // no chat ID configured
      webEnabled: true,
      user: { email: "user@ctm.vn", name: "Test" },
    });

    const { sendNotification } = await import("@/lib/notifications");
    await sendNotification({
      userId: "user-1",
      type: "SYSTEM",
      title: "Thông báo hệ thống",
      body: "Bảo trì lúc 2AM",
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockSendTelegram).not.toHaveBeenCalled();
  });

  it("does NOT send any channel when no channel config", async () => {
    mockChannelFindUnique.mockResolvedValue(null);

    const { sendNotification } = await import("@/lib/notifications");
    await sendNotification({
      userId: "user-1",
      type: "REMINDER",
      title: "Nhắc nhở",
      body: "Tạm ứng sắp đến hạn",
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockSendTelegram).not.toHaveBeenCalled();
  });
});

// ── Telegram Message Format ───────────────────────────────────────────────────

describe("formatTelegramNotification", () => {
  it("formats message with link", async () => {
    const { formatTelegramNotification } = await import("@/lib/telegram");

    // Restore original implementation for this test
    jest.unmock("@/lib/telegram");
    const { formatTelegramNotification: realFormat } = await import(
      "@/lib/telegram"
    );

    const msg = realFormat("Tiêu đề", "Nội dung thông báo", "/payment/1");
    expect(msg).toContain("<b>🔔 Tiêu đề</b>");
    expect(msg).toContain("Nội dung thông báo");
  });
});
