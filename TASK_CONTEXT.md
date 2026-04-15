# TASK CONTEXT — 1Gate System
_Cập nhật lần cuối: 2026-04-15_

## ĐANG LÀM (Current Task)
**Phase 1 — Core Foundation Setup**
**Nhánh:** `feature/phase1-core-setup`
**Trạng thái:** 🔄 IN PROGRESS

## ĐÃ HOÀN THÀNH ✅
- [x] Clone repo (empty)
- [x] Tạo TASK_CONTEXT.md

## ĐANG DỞ 🔄
- [ ] Khởi tạo Next.js 14 App Router + TypeScript
- [ ] Cài shadcn/ui + Tailwind
- [ ] Cấu hình Prisma schema (User, Company, Department, Role, Permission, AuditLog, Notification)
- [ ] Setup NextAuth v5
- [ ] Notification infrastructure (Resend email, Telegram Bot, SSE)
- [ ] Seed data
- [ ] Tests

## VIỆC TIẾP THEO 📋
1. `npx create-next-app@latest` với TypeScript + Tailwind + App Router
2. Cài dependencies: prisma, @prisma/client, next-auth, resend, zod, react-hook-form
3. Cài shadcn/ui
4. Viết `prisma/schema.prisma`
5. Viết `prisma/seed.ts`
6. Setup NextAuth
7. Viết tests
8. Push + PR

## QUYẾT ĐỊNH ĐÃ CHỐT 📌
- Framework: Next.js 14 App Router
- DB: PostgreSQL trên Neon (serverless)
- ORM: Prisma
- Auth: NextAuth v5 (Auth.js)
- UI: shadcn/ui + Tailwind CSS
- Form: React Hook Form + Zod
- File storage: Vercel Blob
- Email: Resend
- Telegram: Telegram Bot API (webhook)
- Realtime notify: SSE (Server-Sent Events)
- Cron: Vercel Cron
- Test: Jest + Supertest + Playwright

## PHÂN QUYỀN (RBAC Roles)
- SUPER_ADMIN: toàn quyền
- ADMIN: quản trị hệ thống trong công ty
- DIRECTOR: duyệt cuối (kế hoạch chi > 5tr)
- ACCOUNTANT: kế toán, lập kế hoạch chi, thanh toán
- DEPT_HEAD: trưởng bộ phận, duyệt cấp 1
- PURCHASER: bộ phận mua hàng, ẩn giá hợp đồng
- WAREHOUSE: thủ kho, ẩn giá hợp đồng
- EMPLOYEE: nhân viên, tạo đề xuất

## APPROVAL LOGIC
- < 1,000,000 VND: DEPT_HEAD
- 1,000,000 – 5,000,000 VND: DEPT_HEAD → ACCOUNTANT
- > 5,000,000 VND: DEPT_HEAD → ACCOUNTANT → DIRECTOR

## FILES QUAN TRỌNG 📁
- `prisma/schema.prisma` — DB schema
- `prisma/seed.ts` — Seed data
- `src/lib/prisma.ts` — Prisma client
- `src/lib/auth.ts` — NextAuth config
- `src/lib/notifications.ts` — Notification service
- `src/middleware.ts` — Route protection

## LỆNH VERIFY
```bash
npx prisma migrate dev
npx prisma db seed
npm test
npm run dev
```

## BLOCKERS ⚠️
- Cần user cung cấp: NEON_DATABASE_URL, RESEND_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
- Vercel project cần được connect với repo trên Vercel dashboard
