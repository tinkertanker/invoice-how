import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { XeroClient } from "@/lib/xero-client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const status = searchParams.get("status")
    const page = searchParams.get("page")
    const pageSize = searchParams.get("pageSize")
    const search = searchParams.get("search")

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      )
    }

    const xeroClient = await XeroClient.getInstance()
    
    const whereConditions: string[] = []
    
    if (status && status !== "all") {
      whereConditions.push(`Status="${status.toUpperCase()}"`)
    } else {
      whereConditions.push(`(Status="DRAFT" OR Status="SUBMITTED" OR Status="AUTHORISED")`)
    }
    
    if (search) {
      whereConditions.push(`(Contact.Name.Contains("${search}") OR InvoiceNumber.Contains("${search}"))`)
    }

    const invoicesResponse = await xeroClient.getInvoices(tenantId, {
      where: whereConditions.join(" AND "),
      orderBy: "UpdatedDateUTC DESC",
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    })
    
    return NextResponse.json({ 
      invoices: invoicesResponse.Invoices || [],
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}