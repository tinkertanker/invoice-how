import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import XeroProvider from "@/lib/auth/xero-provider"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    XeroProvider({
      clientId: process.env.XERO_CLIENT_ID!,
      clientSecret: process.env.XERO_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session?.user) {
        session.user.id = user.id
        session.user.xeroUserId = (user as any).xeroUserId
      }
      if (token?.access_token) {
        session.accessToken = token.access_token as string
        session.refreshToken = token.refresh_token as string
        session.idToken = token.id_token as string
      }
      return session
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.access_token = account.access_token
        token.refresh_token = account.refresh_token
        token.id_token = account.id_token
        token.expires_at = account.expires_at
      }
      if (user) {
        token.xeroUserId = (user as any).xeroUserId
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }