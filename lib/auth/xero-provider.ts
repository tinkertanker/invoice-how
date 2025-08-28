import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth"

export interface XeroProfile {
  sub: string
  email: string
  given_name: string
  family_name: string
  xero_userid: string
  preferred_username: string
  authentication_event_id: string
}

export default function XeroProvider<P extends XeroProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "xero",
    name: "Xero",
    type: "oauth",
    wellKnown: "https://identity.xero.com/.well-known/openid-configuration",
    authorization: {
      params: { 
        scope: "openid profile email accounting.transactions accounting.contacts accounting.settings offline_access",
        prompt: "login"
      }
    },
    idToken: true,
    checks: ["pkce", "state"],
    profile(profile) {
      return {
        id: profile.xero_userid,
        name: `${profile.given_name} ${profile.family_name}`,
        email: profile.email,
        xeroUserId: profile.xero_userid,
      }
    },
    style: {
      logo: "/xero-logo.svg",
      logoDark: "/xero-logo.svg",
      bg: "#13B5EA",
      text: "#fff",
      bgDark: "#13B5EA",
      textDark: "#fff",
    },
    options,
  }
}