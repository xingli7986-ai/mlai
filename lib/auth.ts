import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const MVP_VERIFICATION_CODE = "1234";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const phone =
          typeof credentials?.phone === "string" ? credentials.phone.trim() : "";
        const code =
          typeof credentials?.code === "string" ? credentials.code.trim() : "";

        if (!phone || code !== MVP_VERIFICATION_CODE) return null;

        const user = await prisma.user.upsert({
          where: { phone },
          update: {},
          create: { phone },
        });

        return {
          id: user.id,
          phone: user.phone,
          name: user.name ?? undefined,
          image: user.avatar ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { phone?: string }).phone = token.phone as string;
      }
      return session;
    },
  },
});
