import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { XeroClient } from "@/lib/xero-client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const xeroClient = await XeroClient.getInstance()
    const organizations = await xeroClient.getOrganizations()
    
    return NextResponse.json({ organizations })
  } catch (error) {
    // Check if it's an authentication error
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch organizations"
    if (errorMessage.includes('expired') || errorMessage.includes('unauthorized') || errorMessage.includes('Invalid JSON')) {
      return NextResponse.json(
        { error: "Token expired. Please sign in again." },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}