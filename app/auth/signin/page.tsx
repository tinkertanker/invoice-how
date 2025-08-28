"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export default function SignIn() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in with Xero
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your Xero account to start processing InvoiceNow invoices
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            <p className="text-sm">
              {error === "OAuthSignin" && "Error starting authentication. Please try again."}
              {error === "OAuthCallback" && "Error during authentication. Please ensure your Xero app is configured correctly."}
              {error === "OAuthCreateAccount" && "Could not create account. Please try again."}
              {error === "EmailCreateAccount" && "Could not create account. Please try again."}
              {error === "Callback" && "Error during authentication callback."}
              {error === "OAuthAccountNotLinked" && "This account is already linked to another user."}
              {error === "EmailSignin" && "Check your email for the sign in link."}
              {error === "CredentialsSignin" && "Sign in failed. Check the details you provided are correct."}
              {error === "default" && "Unable to sign in."}
              {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailCreateAccount", "Callback", "OAuthAccountNotLinked", "EmailSignin", "CredentialsSignin", "default"].includes(error) && "An unexpected error occurred."}
            </p>
          </div>
        )}
        
        <button
          onClick={() => signIn("xero", { callbackUrl: "/" })}
          className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Connect with Xero
        </button>
      </div>
    </main>
  )
}