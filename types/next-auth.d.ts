import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      xeroUserId?: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
    accessToken?: string
    refreshToken?: string
    idToken?: string
  }

  interface User {
    xeroUserId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    xeroUserId?: string
    access_token?: string
    refresh_token?: string
    id_token?: string
    expires_at?: number
  }
}