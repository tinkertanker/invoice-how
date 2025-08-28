"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { InvoiceList } from "@/components/invoice-list"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
    
    const storedTenantId = localStorage.getItem("xero-tenant-id")
    const storedTenantName = localStorage.getItem("xero-tenant-name")
    
    if (!storedTenantId) {
      router.push("/")
    } else {
      setTenantId(storedTenantId)
      setTenantName(storedTenantName)
    }
  }, [status, router])

  if (status === "loading" || !tenantId) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  const handleChangeOrganization = () => {
    localStorage.removeItem("xero-tenant-id")
    localStorage.removeItem("xero-tenant-name")
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">InvoiceNow Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Organization: {tenantName || "Unknown"}
              </p>
            </div>
            <button
              onClick={handleChangeOrganization}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Change Organization
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InvoiceList tenantId={tenantId} />
      </div>
    </main>
  )
}