"use client"

import { signIn, signOut, useSession } from "next-auth/react"

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
          <div className="text-center">
            <p className="mb-4 text-gray-700">
              Welcome, {session.user?.name || session.user?.email}!
            </p>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Sign Out
            </button>
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