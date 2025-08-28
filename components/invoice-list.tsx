"use client"

import { useEffect, useState } from "react"
import { format, parseISO, isValid } from "date-fns"

interface Invoice {
  InvoiceID: string
  InvoiceNumber?: string
  Type: string
  Contact: {
    ContactID: string
    Name: string
    EmailAddress?: string
  }
  Date: string
  DueDate: string
  Status: string
  Total: number
  AmountDue: number
  CurrencyCode: string
  Reference?: string
}

interface InvoiceListProps {
  tenantId: string
}

export function InvoiceList({ tenantId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    fetchInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, statusFilter, searchTerm, page])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        tenantId,
        status: statusFilter,
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      
      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/xero/invoices?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch invoices")
      }
      
      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectInvoice = (invoiceId: string) => {
    const newSelection = new Set(selectedInvoices)
    if (newSelection.has(invoiceId)) {
      newSelection.delete(invoiceId)
    } else {
      newSelection.add(invoiceId)
    }
    setSelectedInvoices(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedInvoices.size === invoices.length) {
      setSelectedInvoices(new Set())
    } else {
      setSelectedInvoices(new Set(invoices.map(inv => inv.InvoiceID)))
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "authorised":
      case "authorized":
        return "bg-green-100 text-green-800"
      case "paid":
        return "bg-purple-100 text-purple-800"
      case "voided":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleProcessSelected = () => {
    console.log("Processing invoices:", Array.from(selectedInvoices))
  }

  if (loading && invoices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invoices...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchInvoices}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoices</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by contact name or invoice number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Unsent</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="authorised">Authorised</option>
            </select>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No invoices found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.size === invoices.length && invoices.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.InvoiceID}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.has(invoice.InvoiceID)}
                          onChange={() => handleSelectInvoice(invoice.InvoiceID)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.InvoiceNumber || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.Contact.Name}
                          </div>
                          {invoice.Contact.EmailAddress && (
                            <div className="text-sm text-gray-500">
                              {invoice.Contact.EmailAddress}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          if (!invoice.Date) return "-"
                          try {
                            const date = parseISO(invoice.Date)
                            return isValid(date) ? format(date, "dd MMM yyyy") : "-"
                          } catch {
                            return "-"
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          if (!invoice.DueDate) return "-"
                          try {
                            const date = parseISO(invoice.DueDate)
                            return isValid(date) ? format(date, "dd MMM yyyy") : "-"
                          } catch {
                            return "-"
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.Total, invoice.CurrencyCode)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.Status)}`}>
                          {invoice.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={invoices.length < pageSize}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              
              {selectedInvoices.size > 0 && (
                <button
                  onClick={handleProcessSelected}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Process {selectedInvoices.size} Invoice{selectedInvoices.size !== 1 ? "s" : ""} with InvoiceNow
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}