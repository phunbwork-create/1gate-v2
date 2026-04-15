import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth.schema";
import type { SessionUser } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email, isActive: true },
          include: {
            role: true,
            company: true,
            department: true,
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roleName: user.role.name,
          roleId: user.roleId,
          companyId: user.companyId,
          companyCode: user.company.code,
          departmentId: user.departmentId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as SessionUser & { id: string };
        token.id = u.id;
        token.roleName = u.roleName;
        token.roleId = u.roleId;
        token.companyId = u.companyId;
        token.companyCode = u.companyCode;
        token.departmentId = u.departmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as SessionUser).roleName = token.roleName as SessionUser["roleName"];
        (session.user as SessionUser).roleId = token.roleId as string;
        (session.user as SessionUser).companyId = token.companyId as string;
        (session.user as SessionUser).companyCode = token.companyCode as string;
        (session.user as SessionUser).departmentId = token.departmentId as string | null;
      }
      return session;
    },
  },
});
