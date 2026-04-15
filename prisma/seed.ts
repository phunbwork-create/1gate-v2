import { PrismaClient, RoleName } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "Password@123";

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Roles ────────────────────────────────────────────────────────────────
  const rolesData: { name: RoleName; displayName: string; description: string }[] = [
    { name: "SUPER_ADMIN", displayName: "Super Admin", description: "Toàn quyền hệ thống" },
    { name: "ADMIN", displayName: "Quản trị viên", description: "Quản trị công ty" },
    { name: "DIRECTOR", displayName: "Giám đốc", description: "Phê duyệt cuối cùng" },
    { name: "ACCOUNTANT", displayName: "Kế toán", description: "Kiểm tra và lập kế hoạch chi" },
    { name: "DEPT_HEAD", displayName: "Trưởng bộ phận", description: "Duyệt cấp 1" },
    { name: "PURCHASER", displayName: "Mua hàng", description: "Lập đề nghị mua hàng & thanh toán" },
    { name: "WAREHOUSE", displayName: "Thủ kho", description: "Kiểm tra tồn kho" },
    { name: "EMPLOYEE", displayName: "Nhân viên", description: "Tạo đề xuất" },
  ];

  const roles: Record<RoleName, { id: string; name: RoleName }> = {} as never;

  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: r,
    });
    roles[r.name] = role;
  }
  console.log("✅ Roles created");

  // ── 2. Companies ─────────────────────────────────────────────────────────────
  const ctm = await prisma.company.upsert({
    where: { code: "CTM" },
    update: {},
    create: { name: "Công ty Mẹ", code: "CTM" },
  });

  const ctva = await prisma.company.upsert({
    where: { code: "CTVA" },
    update: {},
    create: { name: "Công ty Thành viên A", code: "CTVA" },
  });
  console.log("✅ Companies created");

  // ── 3. Departments ────────────────────────────────────────────────────────────
  const deptData = [
    { name: "Ban Giám đốc", code: "BGD" },
    { name: "Phòng Kế toán", code: "KT" },
    { name: "Phòng Mua hàng", code: "MH" },
    { name: "Phòng Kho vận", code: "KV" },
    { name: "Phòng Kỹ thuật", code: "KT2" },
  ];

  const deptsCTM: Record<string, { id: string }> = {};
  const deptsCTVA: Record<string, { id: string }> = {};

  for (const d of deptData) {
    deptsCTM[d.code] = await prisma.department.upsert({
      where: { companyId_code: { companyId: ctm.id, code: d.code } },
      update: {},
      create: { ...d, companyId: ctm.id },
    });
    deptsCTVA[d.code] = await prisma.department.upsert({
      where: { companyId_code: { companyId: ctva.id, code: d.code } },
      update: {},
      create: { ...d, companyId: ctva.id },
    });
  }
  console.log("✅ Departments created");

  // ── 4. Users ─────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const usersData = [
    // CTM — 1 per role
    {
      email: "superadmin@ctm.vn",
      name: "Super Admin",
      roleName: "SUPER_ADMIN" as RoleName,
      companyId: ctm.id,
      departmentCode: "BGD",
      companyDepts: deptsCTM,
    },
    {
      email: "admin@ctm.vn",
      name: "Nguyễn Quản Trị",
      roleName: "ADMIN" as RoleName,
      companyId: ctm.id,
      departmentCode: "BGD",
      companyDepts: deptsCTM,
    },
    {
      email: "giamdoc@ctm.vn",
      name: "Trần Văn Giám Đốc",
      roleName: "DIRECTOR" as RoleName,
      companyId: ctm.id,
      departmentCode: "BGD",
      companyDepts: deptsCTM,
    },
    {
      email: "ketoan@ctm.vn",
      name: "Lê Thị Kế Toán",
      roleName: "ACCOUNTANT" as RoleName,
      companyId: ctm.id,
      departmentCode: "KT",
      companyDepts: deptsCTM,
    },
    {
      email: "truongbp@ctm.vn",
      name: "Phạm Trưởng Bộ Phận",
      roleName: "DEPT_HEAD" as RoleName,
      companyId: ctm.id,
      departmentCode: "MH",
      companyDepts: deptsCTM,
    },
    {
      email: "muahang@ctm.vn",
      name: "Ngô Thị Mua Hàng",
      roleName: "PURCHASER" as RoleName,
      companyId: ctm.id,
      departmentCode: "MH",
      companyDepts: deptsCTM,
    },
    {
      email: "thukho@ctm.vn",
      name: "Đỗ Văn Thủ Kho",
      roleName: "WAREHOUSE" as RoleName,
      companyId: ctm.id,
      departmentCode: "KV",
      companyDepts: deptsCTM,
    },
    {
      email: "nhanvien@ctm.vn",
      name: "Vũ Nhân Viên",
      roleName: "EMPLOYEE" as RoleName,
      companyId: ctm.id,
      departmentCode: "KT2",
      companyDepts: deptsCTM,
    },
    // CTVA — 2 employees
    {
      email: "nhanvien1@ctva.vn",
      name: "Bùi Nhân Viên 1",
      roleName: "EMPLOYEE" as RoleName,
      companyId: ctva.id,
      departmentCode: "MH",
      companyDepts: deptsCTVA,
    },
    {
      email: "nhanvien2@ctva.vn",
      name: "Hoàng Nhân Viên 2",
      roleName: "EMPLOYEE" as RoleName,
      companyId: ctva.id,
      departmentCode: "KT",
      companyDepts: deptsCTVA,
    },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        hashedPassword,
        roleId: roles[u.roleName].id,
        companyId: u.companyId,
        departmentId: u.companyDepts[u.departmentCode]?.id,
      },
    });

    // Create default notification channel for each user
    await prisma.notificationChannel.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        emailEnabled: true,
        webEnabled: true,
        telegramEnabled: false,
      },
    });
  }
  console.log("✅ Users created (10 users)");

  // ── 5. Permissions (RBAC) ─────────────────────────────────────────────────────
  const permissions = [
    // EMPLOYEE: tạo đề xuất
    { roleName: "EMPLOYEE" as RoleName, action: "create", resource: "payment_request" },
    { roleName: "EMPLOYEE" as RoleName, action: "read", resource: "own_requests" },

    // PURCHASER: tạo + đọc (ẩn giá)
    { roleName: "PURCHASER" as RoleName, action: "create", resource: "payment_request" },
    { roleName: "PURCHASER" as RoleName, action: "read", resource: "payment_request" },

    // WAREHOUSE: đọc (ẩn giá)
    { roleName: "WAREHOUSE" as RoleName, action: "read", resource: "purchase_request" },
    { roleName: "WAREHOUSE" as RoleName, action: "update", resource: "stock_check" },

    // DEPT_HEAD: tạo + duyệt cấp 1
    { roleName: "DEPT_HEAD" as RoleName, action: "create", resource: "payment_request" },
    { roleName: "DEPT_HEAD" as RoleName, action: "read", resource: "payment_request" },
    { roleName: "DEPT_HEAD" as RoleName, action: "approve", resource: "payment_request" },
    { roleName: "DEPT_HEAD" as RoleName, action: "reject", resource: "payment_request" },

    // ACCOUNTANT: full tài chính
    { roleName: "ACCOUNTANT" as RoleName, action: "create", resource: "payment_plan" },
    { roleName: "ACCOUNTANT" as RoleName, action: "read", resource: "payment_request" },
    { roleName: "ACCOUNTANT" as RoleName, action: "approve", resource: "payment_request" },
    { roleName: "ACCOUNTANT" as RoleName, action: "reject", resource: "payment_request" },
    { roleName: "ACCOUNTANT" as RoleName, action: "create", resource: "settlement" },
    { roleName: "ACCOUNTANT" as RoleName, action: "cancel", resource: "payment_request" },

    // DIRECTOR: duyệt cuối
    { roleName: "DIRECTOR" as RoleName, action: "read", resource: "payment_plan" },
    { roleName: "DIRECTOR" as RoleName, action: "approve", resource: "payment_plan" },
    { roleName: "DIRECTOR" as RoleName, action: "reject", resource: "payment_plan" },

    // ADMIN: quản trị
    { roleName: "ADMIN" as RoleName, action: "manage", resource: "users" },
    { roleName: "ADMIN" as RoleName, action: "manage", resource: "departments" },

    // SUPER_ADMIN: tất cả
    { roleName: "SUPER_ADMIN" as RoleName, action: "manage", resource: "all" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: {
        roleId_action_resource: {
          roleId: roles[p.roleName].id,
          action: p.action,
          resource: p.resource,
        },
      },
      update: {},
      create: {
        roleId: roles[p.roleName].id,
        action: p.action,
        resource: p.resource,
      },
    });
  }
  console.log("✅ Permissions seeded");

  console.log("\n🎉 Seed completed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Test accounts (password: Password@123):");
  console.log("  superadmin@ctm.vn — Super Admin");
  console.log("  admin@ctm.vn      — Admin");
  console.log("  giamdoc@ctm.vn    — Giám đốc");
  console.log("  ketoan@ctm.vn     — Kế toán");
  console.log("  truongbp@ctm.vn   — Trưởng bộ phận");
  console.log("  muahang@ctm.vn    — Mua hàng");
  console.log("  thukho@ctm.vn     — Thủ kho");
  console.log("  nhanvien@ctm.vn   — Nhân viên (CTM)");
  console.log("  nhanvien1@ctva.vn — Nhân viên 1 (CTVA)");
  console.log("  nhanvien2@ctva.vn — Nhân viên 2 (CTVA)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
