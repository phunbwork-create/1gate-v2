/**
 * Edge-compatible NextAuth config — NO database imports.
 * Used only in middleware (Edge Runtime) for JWT verification.
 * Full auth config with PrismaAdapter lives in src/lib/auth.ts.
 */
import NextAuth from "next-auth";

export const { auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
