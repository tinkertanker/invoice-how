"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Organization {
  tenantId: string
  tenantName: string
  tenantType: string
  isActive: boolean
}

export function OrganizationSelector() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrg, setSelectedOrg] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/xero/organizations")
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401 || errorData.error?.includes('expired')) {
          // Token expired, need to re-authenticate
          setError('Your session has expired. Redirecting to sign in...')
          // Redirect to sign out which will clear the session
          setTimeout(() => {
            window.location.href = '/api/auth/signout?callbackUrl=/'
          }, 2000)
          return
        }
        throw new Error("Failed to fetch organizations")
      }
      
      const data = await response.json()
      setOrganizations(data.organizations || [])
      
      if (data.organizations?.length === 1) {
        setSelectedOrg(data.organizations[0].tenantId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOrganization = () => {
    if (selectedOrg) {
      localStorage.setItem("xero-tenant-id", selectedOrg)
      const selectedOrgData = organizations.find(org => org.tenantId === selectedOrg)
      if (selectedOrgData) {
        localStorage.setItem("xero-tenant-name", selectedOrgData.tenantName)
      }
      router.push("/dashboard")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchOrganizations}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Organizations Found
        </h3>
        <p className="text-gray-600">
          You don&apos;t have access to any Xero organizations. Please ensure your Xero account has the necessary permissions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Organization</h2>
        <p className="text-gray-600">
          Choose which Xero organization you want to work with:
        </p>
      </div>

      <div className="space-y-3">
        {organizations.map((org) => (
          <label
            key={org.tenantId}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
              selectedOrg === org.tenantId
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="organization"
              value={org.tenantId}
              checked={selectedOrg === org.tenantId}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="mr-3"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{org.tenantName}</p>
              <p className="text-sm text-gray-500">
                {org.tenantType} • {org.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSelectOrganization}
        disabled={!selectedOrg}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
          selectedOrg
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Continue to Dashboard
      </button>
    </div>
  )
}