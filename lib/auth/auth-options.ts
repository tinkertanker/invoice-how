import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import XeroProvider from "@/lib/auth/xero-provider"

async function refreshAccessToken(token: any) {
  try {
    const clientId = process.env.XERO_CLIENT_ID!
    const clientSecret = process.env.XERO_CLIENT_SECRET!
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    
    const response = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refresh_token: refreshedTokens.refresh_token || token.refresh_token,
    }
  } catch (error) {
    console.error("Error refreshing access token", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    XeroProvider({
      clientId: process.env.XERO_CLIENT_ID!,
      clientSecret: process.env.XERO_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.sub as string
        session.user.xeroUserId = token.xeroUserId as string
      }
      if (token?.access_token) {
        session.accessToken = token.access_token as string
        session.refreshToken = token.refresh_token as string
        session.idToken = token.id_token as string
      }
      return session
    },
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          id_token: account.id_token,
          expires_at: account.expires_at,
          xeroUserId: (user as any).xeroUserId,
        }
      }

      // Return previous token if not expired
      if (Date.now() < (token.expires_at as number) * 1000) {
        return token
      }

      // Token has expired, refresh it
      return await refreshAccessToken(token)
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