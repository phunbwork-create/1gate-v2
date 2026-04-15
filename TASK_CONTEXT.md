# TASK CONTEXT — 1Gate System
_Cập nhật lần cuối: 2026-04-16_

## ĐANG LÀM (Current Task)
**Phase 1 — Core Foundation Setup**
**Nhánh:** `feature/phase1-core-setup`
**Trạng thái:** 🔄 IN PROGRESS

## ĐÃ HOÀN THÀNH ✅
- [x] Next.js 16 scaffold + TypeScript + Tailwind
- [x] Tất cả dependencies (prisma, next-auth, resend, zod, react-hook-form, shadcn...)
- [x] shadcn/ui init + 15 components
- [x] Prisma schema: Company, Department, Role, Permission, User, Account, Session, NotificationChannel, Notification, AuditLog
- [x] prisma.config.ts (load .env.local via @next/env)
- [x] NextAuth v5: src/lib/auth.ts (Credentials + JWT)
- [x] Middleware: src/middleware.ts (route protection)
- [x] API route: src/app/api/auth/[...nextauth]/route.ts
- [x] Notification infra: resend.ts, telegram.ts, notifications.ts (SSE + email + telegram)
- [x] SSE endpoint: src/app/api/notifications/sse/route.ts
- [x] Telegram webhook: src/app/api/webhooks/telegram/route.ts
- [x] Prisma seed: prisma/seed.ts (2 cty, 8 roles, 10 users, permissions)
- [x] Types: src/types/index.ts
- [x] Schemas: src/schemas/auth.schema.ts
- [x] CLAUDE.md (Next.js 16 breaking changes guide)
- [x] .env.example, .env.local (Telegram token đã điền)

## ĐANG DỞ 🔄
- [ ] Jest config + test scripts trong package.json
- [ ] next-auth.d.ts (TypeScript type augmentation)
- [ ] Viết tests: auth, notifications, rbac
- [ ] UI: Login page
- [ ] UI: App layout (sidebar + header)
- [ ] UI: Dashboard page
- [ ] Notification bell component (SSE consumer)
- [ ] Push lên git + tạo PR

## VIỆC TIẾP THEO 📋
1. Thêm seed script vào package.json
2. Viết jest.config.ts
3. Viết next-auth.d.ts
4. Viết tests: src/__tests__/auth.test.ts, rbac.test.ts, notifications.test.ts
5. Viết Login page UI
6. Viết App layout với sidebar
7. Viết Dashboard page
8. Viết NotificationBell component (SSE)
9. Push: develop branch → feature/phase1-core-setup → PR

## QUYẾT ĐỊNH ĐÃ CHỐT 📌
- Framework: Next.js 16 App Router + React 19
- DB: PostgreSQL trên Neon (serverless)
- ORM: Prisma 7
- Auth: NextAuth v5 (Auth.js beta)
- UI: shadcn/ui + Tailwind CSS v4
- Notification: Resend (email) + Telegram Bot API + SSE (web)
- Test: Jest + ts-jest + supertest

## ENV VARS STATUS
- DATABASE_URL: ❌ cần tạo Neon DB
- NEXTAUTH_SECRET: ❌ cần generate
- RESEND_API_KEY: ❌ cần tạo account resend.com
- TELEGRAM_BOT_TOKEN: ✅ đã có (8562850963:AAHHJDoQiyDqRfxEKrP08F6dXRlLso1HEwE)
- TELEGRAM_CHAT_ID: ❌ cần user dùng /chatid trong bot

## FILES QUAN TRỌNG 📁
- prisma/schema.prisma
- prisma/seed.ts
- src/lib/prisma.ts
- src/lib/auth.ts
- src/lib/notifications.ts
- src/middleware.ts

## BLOCKERS ⚠️
- DATABASE_URL chưa có → chưa chạy được migrate/seed/tests thật
- Vercel chưa connect repo
