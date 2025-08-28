import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"

interface XeroTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  tenant_id?: string
}

interface XeroOrganization {
  tenantId: string
  tenantName: string
  tenantType: string
  createdDateUtc: string
  isActive: boolean
}

interface XeroContact {
  ContactID: string
  Name: string
  EmailAddress?: string
  FirstName?: string
  LastName?: string
  ContactPersons?: Array<{
    FirstName: string
    LastName: string
    EmailAddress: string
    IncludeInEmails: boolean
  }>
  Addresses?: Array<{
    AddressType: string
    City?: string
    Region?: string
    PostalCode?: string
    Country?: string
    AddressLine1?: string
    AddressLine2?: string
  }>
  UpdatedDateUTC: string
}

interface XeroInvoice {
  InvoiceID: string
  Type: string
  Contact: XeroContact
  Date: string
  DueDate: string
  Status: string
  LineAmountTypes: string
  LineItems: Array<{
    Description: string
    Quantity: number
    UnitAmount: number
    AccountCode?: string
    TaxType?: string
    LineAmount: number
  }>
  SubTotal: number
  TotalTax: number
  Total: number
  AmountDue: number
  AmountPaid: number
  UpdatedDateUTC: string
  CurrencyCode: string
  InvoiceNumber?: string
  Reference?: string
}

export class XeroClient {
  private baseUrl = "https://api.xero.com/api.xro/2.0"
  private identityUrl = "https://identity.xero.com"
  
  constructor(private tokens: XeroTokens) {}

  static async getInstance(): Promise<XeroClient> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("No authenticated session found")
    }

    // In JWT strategy, tokens are stored in the session, not in the database
    if (!session.accessToken || !session.refreshToken) {
      throw new Error("No Xero tokens found in session")
    }

    const tokens: XeroTokens = {
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      expires_at: 0, // We'll need to track this differently with JWT
    }

    const client = new XeroClient(tokens)
    
    // For now, we won't auto-refresh in JWT mode
    // This would need to be handled differently
    
    return client
  }

  private async refreshAccessToken(userId: string): Promise<void> {
    const clientId = process.env.XERO_CLIENT_ID
    const clientSecret = process.env.XERO_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing Xero OAuth credentials")
    }

    const tokenUrl = `${this.identityUrl}/connect/token`
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.tokens.refresh_token,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to refresh Xero token: ${error}`)
    }

    const data = await response.json()
    
    this.tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || this.tokens.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    }

    await prisma.account.updateMany({
      where: {
        userId,
        provider: "xero",
      },
      data: {
        access_token: this.tokens.access_token,
        refresh_token: this.tokens.refresh_token,
        expires_at: this.tokens.expires_at,
      },
    })
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    tenantId?: string
  ): Promise<T> {
    const headers: HeadersInit = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.tokens.access_token}`,
      ...(tenantId && { "xero-tenant-id": tenantId }),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await this.refreshAccessToken(session.user.id)
        
        const updatedHeaders = {
          ...headers,
          "Authorization": `Bearer ${this.tokens.access_token}`,
        }
        const retryResponse = await fetch(url, {
          ...options,
          headers: updatedHeaders,
        })

        if (!retryResponse.ok) {
          const error = await retryResponse.text()
          throw new Error(`Xero API error: ${error}`)
        }

        return retryResponse.json()
      }
    }

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Xero API error: ${error}`)
    }

    return response.json()
  }

  async getOrganizations(): Promise<XeroOrganization[]> {
    // Note: The connections endpoint is on the main API, not the identity server
    const url = `https://api.xero.com/connections`
    return this.makeRequest<XeroOrganization[]>(url)
  }

  async getInvoices(
    tenantId: string,
    options?: {
      where?: string
      orderBy?: string
      page?: number
      pageSize?: number
      includeArchived?: boolean
    }
  ): Promise<{ Invoices: XeroInvoice[] }> {
    const params = new URLSearchParams()
    
    if (options?.where) params.append("where", options.where)
    if (options?.orderBy) params.append("order", options.orderBy)
    if (options?.page) params.append("page", options.page.toString())
    if (options?.pageSize) params.append("pageSize", options.pageSize.toString())
    if (options?.includeArchived) params.append("includeArchived", "true")

    const queryString = params.toString()
    const url = `${this.baseUrl}/Invoices${queryString ? `?${queryString}` : ""}`
    
    return this.makeRequest<{ Invoices: XeroInvoice[] }>(url, {}, tenantId)
  }

  async getInvoice(tenantId: string, invoiceId: string): Promise<{ Invoices: [XeroInvoice] }> {
    const url = `${this.baseUrl}/Invoices/${invoiceId}`
    return this.makeRequest<{ Invoices: [XeroInvoice] }>(url, {}, tenantId)
  }

  async updateInvoice(
    tenantId: string,
    invoiceId: string,
    updates: Partial<XeroInvoice>
  ): Promise<{ Invoices: [XeroInvoice] }> {
    const url = `${this.baseUrl}/Invoices/${invoiceId}`
    return this.makeRequest<{ Invoices: [XeroInvoice] }>(
      url,
      {
        method: "POST",
        body: JSON.stringify({ Invoices: [updates] }),
      },
      tenantId
    )
  }

  async getContacts(
    tenantId: string,
    options?: {
      where?: string
      orderBy?: string
      page?: number
      pageSize?: number
    }
  ): Promise<{ Contacts: XeroContact[] }> {
    const params = new URLSearchParams()
    
    if (options?.where) params.append("where", options.where)
    if (options?.orderBy) params.append("order", options.orderBy)
    if (options?.page) params.append("page", options.page.toString())
    if (options?.pageSize) params.append("pageSize", options.pageSize.toString())

    const queryString = params.toString()
    const url = `${this.baseUrl}/Contacts${queryString ? `?${queryString}` : ""}`
    
    return this.makeRequest<{ Contacts: XeroContact[] }>(url, {}, tenantId)
  }

  async getContact(tenantId: string, contactId: string): Promise<{ Contacts: [XeroContact] }> {
    const url = `${this.baseUrl}/Contacts/${contactId}`
    return this.makeRequest<{ Contacts: [XeroContact] }>(url, {}, tenantId)
  }

  async updateContact(
    tenantId: string,
    contactId: string,
    updates: Partial<XeroContact>
  ): Promise<{ Contacts: [XeroContact] }> {
    const url = `${this.baseUrl}/Contacts/${contactId}`
    return this.makeRequest<{ Contacts: [XeroContact] }>(
      url,
      {
        method: "POST",
        body: JSON.stringify({ Contacts: [updates] }),
      },
      tenantId
    )
  }

  async createContact(
    tenantId: string,
    contact: Partial<XeroContact>
  ): Promise<{ Contacts: [XeroContact] }> {
    const url = `${this.baseUrl}/Contacts`
    return this.makeRequest<{ Contacts: [XeroContact] }>(
      url,
      {
        method: "PUT",
        body: JSON.stringify({ Contacts: [contact] }),
      },
      tenantId
    )
  }
}