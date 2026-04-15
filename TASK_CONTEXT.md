# TASK CONTEXT — 1Gate System
_Cập nhật lần cuối: 2026-04-16_

## PHASE 1 — HOÀN THÀNH ✅
**Nhánh:** `feature/phase1-core-setup` → `develop`
**Trạng thái:** ✅ DONE — chờ bạn review + setup env vars

## ĐÃ HOÀN THÀNH ✅
- [x] Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui (Base UI)
- [x] Prisma 7 schema: 10 models (Company, Department, Role, Permission, User, Account, Session, NotificationChannel, Notification, AuditLog)
- [x] prisma.config.ts (load .env.local, Prisma 7 compatible)
- [x] NextAuth v5: JWT strategy, Credentials + bcrypt, session types
- [x] Middleware: route protection, redirect to /login
- [x] Notification: Resend email + Telegram Bot API + SSE realtime
- [x] API: /api/notifications, /api/notifications/sse, /api/notifications/read-all, /api/webhooks/telegram
- [x] UI: Login page, App layout (sidebar + header), Dashboard, NotificationBell
- [x] Seed: 2 companies (CTM, CTVA), 8 roles, 10 users, RBAC permissions
- [x] Tests: 37/37 passing (auth.test, rbac.test, notifications.test)
- [x] TypeScript: 0 errors
- [x] Git: pushed develop + feature/phase1-core-setup

## VIỆC CẦN LÀM TRƯỚC KHI CHẠY ⚠️

### 1. Tạo Neon Database (miễn phí)
1. Vào https://neon.tech → Sign up
2. Create project → Copy "Connection string"
3. Điền vào `.env.local`: `DATABASE_URL="postgresql://..."`
4. Thêm `DIRECT_URL` (cũng từ Neon — "Pooler" connection)

### 2. Generate NEXTAUTH_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Điền vào `.env.local`: `NEXTAUTH_SECRET="..."`

### 3. Tạo Resend account (miễn phí)
1. Vào https://resend.com → Sign up
2. Create API Key → Copy
3. Điền: `RESEND_API_KEY="re_..."`

### 4. Setup Telegram CHAT_ID
1. Mở Telegram → tìm bot `@phunb_bot`
2. Gõ `/chatid`
3. Copy ID nhận được → điền `TELEGRAM_CHAT_ID="-100..."`

### 5. Chạy migration + seed
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Connect Vercel
1. Vào https://vercel.com → New Project → Import `phunbwork-create/1gate-v2`
2. Set env vars (từ .env.local)
3. Deploy

## PHASE 2 — TIẾP THEO
**Nhánh sẽ tạo:** `feature/phase2-procurement`
**Nội dung:**
- F-02: Kế hoạch Đầu tư / Mua sắm (form + workflow)
- F-03: Đề nghị Cấp vật tư nội bộ
- F-04: Đề nghị Mua hàng (PR) + Thủ kho xác nhận tồn kho

## TEST ACCOUNTS
| Email | Role | Password |
|-------|------|----------|
| superadmin@ctm.vn | Super Admin | Password@123 |
| admin@ctm.vn | Admin | Password@123 |
| giamdoc@ctm.vn | Giám đốc | Password@123 |
| ketoan@ctm.vn | Kế toán | Password@123 |
| truongbp@ctm.vn | Trưởng bộ phận | Password@123 |
| muahang@ctm.vn | Mua hàng | Password@123 |
| thukho@ctm.vn | Thủ kho | Password@123 |
| nhanvien@ctm.vn | Nhân viên | Password@123 |

## ENV VARS STATUS
- DATABASE_URL: ❌ cần tạo Neon DB
- NEXTAUTH_SECRET: ❌ cần generate
- RESEND_API_KEY: ❌ cần tạo Resend account
- TELEGRAM_BOT_TOKEN: ✅ 8562850963:AAHHJDoQiyDqRfxEKrP08F6dXRlLso1HEwE
- TELEGRAM_CHAT_ID: ❌ dùng /chatid trong bot
