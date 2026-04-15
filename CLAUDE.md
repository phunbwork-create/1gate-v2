# 1Gate System — Claude Code Guide

## Next.js 16 Breaking Changes (MUST READ)
- `params` and `searchParams` in pages/layouts are now **Promises** → must `await` them
- `cookies()`, `headers()`, `draftMode()` are now **async** → must `await`
- Caching is **opt-in** (no default fetch caching) — use `unstable_cache` or `cache:` option explicitly
- Use `"use server"` for Server Actions, `"use client"` for Client Components

## Project: 1Gate Payment Approval System
- **Stack:** Next.js 16 App Router + TypeScript + shadcn/ui + Prisma + PostgreSQL
- **Auth:** NextAuth v5 (Auth.js) with Credentials provider
- **Notifications:** Resend (email) + Telegram Bot API + SSE (web)

## Key Conventions
- Server Components by default — add `"use client"` only when needed (hooks, events)
- API routes in `src/app/api/` using Route Handlers
- Prisma client singleton at `src/lib/prisma.ts`
- All business logic in `src/lib/` or `src/services/`
- Zod schemas in `src/schemas/`
- Types in `src/types/`

## Approval Logic
- < 1,000,000 VND: DEPT_HEAD only
- 1,000,000 – 5,000,000 VND: DEPT_HEAD → ACCOUNTANT
- > 5,000,000 VND: DEPT_HEAD → ACCOUNTANT → DIRECTOR

## Role Visibility Rules
- PURCHASER, WAREHOUSE: cannot see contract prices (hidden)
- DIRECTOR, ACCOUNTANT, ADMIN, SUPER_ADMIN: full visibility
