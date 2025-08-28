"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem signing you in.
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          <p className="text-sm">
            {error === "Configuration" && "There is a problem with the server configuration. Please contact support."}
            {error === "AccessDenied" && "You do not have permission to sign in."}
            {error === "Verification" && "The verification token has expired or has already been used."}
            {!["Configuration", "AccessDenied", "Verification"].includes(error || "") && "An unexpected error occurred during authentication."}
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
}