"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { OrganizationSelector } from "@/components/organization-selector"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          InvoiceNow for Xero
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Streamline your Singapore government invoicing workflow
        </p>
        
        {session ? (
          <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <p className="text-gray-700">
                Welcome, {session.user?.name || session.user?.email}!
              </p>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 underline mt-2"
              >
                Sign out
              </button>
            </div>
            <OrganizationSelector />
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => signIn("xero")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Connect with Xero
            </button>
          </div>
        )}
      </div>
    </main>
  )
}