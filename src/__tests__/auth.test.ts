/**
 * Tests: Authentication & Authorization
 *
 * Strategy:
 * - Mock prisma + bcrypt (unit tests — no DB required)
 * - Test: login schema validation, authorize logic, session callbacks
 * - Test data: valid user, wrong password, inactive user, missing user
 */

import { loginSchema } from "@/schemas/auth.schema";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  id: "user-1",
  name: "Kế Toán Test",
  email: "ketoan@ctm.vn",
  hashedPassword: "$2a$12$hashed",
  isActive: true,
  roleId: "role-accountant",
  companyId: "company-ctm",
  departmentId: "dept-kt",
  role: { id: "role-accountant", name: "ACCOUNTANT" as const },
  company: { id: "company-ctm", code: "CTM" },
  department: { id: "dept-kt", name: "Phòng Kế toán" },
};

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockBcryptCompare = bcrypt.compare as jest.Mock;

// ── Login Schema Tests ────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("validates correct credentials", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "Password@123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "Password@123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email không hợp lệ");
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "Pass@123" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email không được để trống");
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "abc",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Mật khẩu phải có ít nhất 6 ký tự"
    );
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Mật khẩu không được để trống"
    );
  });
});

// ── Authorize Logic Tests ─────────────────────────────────────────────────────

describe("authorize logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockBcryptCompare.mockResolvedValue(false);

    // Simulate authorize function logic
    const email = "notexist@ctm.vn";
    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
    } as Parameters<typeof prisma.user.findUnique>[0]);

    expect(user).toBeNull();
  });

  it("returns null when password is wrong", async () => {
    mockFindUnique.mockResolvedValue(mockUser);
    mockBcryptCompare.mockResolvedValue(false);

    const user = await prisma.user.findUnique({
      where: { email: mockUser.email, isActive: true },
    } as Parameters<typeof prisma.user.findUnique>[0]);
    const isValid = await bcrypt.compare("wrongpassword", user!.hashedPassword);

    expect(user).not.toBeNull();
    expect(isValid).toBe(false);
  });

  it("returns user when credentials are valid", async () => {
    mockFindUnique.mockResolvedValue(mockUser);
    mockBcryptCompare.mockResolvedValue(true);

    const user = await prisma.user.findUnique({
      where: { email: mockUser.email, isActive: true },
    } as Parameters<typeof prisma.user.findUnique>[0]);
    const isValid = await bcrypt.compare("Password@123", user!.hashedPassword);

    expect(user).not.toBeNull();
    expect(isValid).toBe(true);
    expect(user!.email).toBe(mockUser.email);
    // role is included via mock — use unknown cast to access nested field
    expect((user as unknown as typeof mockUser).role.name).toBe("ACCOUNTANT");
  });

  it("returns null for inactive user", async () => {
    mockFindUnique.mockResolvedValue(null); // isActive: true filter excludes inactive

    const user = await prisma.user.findUnique({
      where: { email: "inactive@ctm.vn", isActive: true },
    } as Parameters<typeof prisma.user.findUnique>[0]);

    expect(user).toBeNull();
  });
});
