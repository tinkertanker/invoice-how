# InvoiceNow-Xero Integration Web App

## Project Overview
A web application that streamlines the process of sending invoices from Xero to Singapore government agencies via the InvoiceNow (Peppol) network. This tool addresses the complex requirements and field mappings needed when invoicing government entities through IMDA's InvoiceNow system.

## Core Problem Statement
Singapore government agencies require specific invoice formats and field mappings when receiving e-invoices through InvoiceNow:
- All agencies share the same UEN (meta UEN) and use overloaded fields for internal routing
- Specific business unit codes must be prepended to contact names
- Special "fake email addresses" in format `0195-SGUENT08GA0028A@invoi.ci` are required
- Extra line items must serve as invoice descriptions
- Dates must be current (no post-dating)
- Contact person must be updated for each different school/agency

## Key Features

### 1. Authentication & Organization Selection
- OAuth2 login via Xero
- List and select from available Xero organizations
- Secure token management

### 2. Invoice Management Dashboard
- Search and filter unsent invoices
- Bulk selection for InvoiceNow conversion
- Preview of required field changes before sending

### 3. InvoiceNow Field Transformation
- **Contact Name Mapping**: Automatically prepend business unit codes (e.g., "9079 - Fuhua Pri Sch")
- **Email Address Conversion**: Convert Peppol IDs to InvoiceNow format
  - Fetch from https://peppoldirectory.sg
  - Transform format: `0195:SGUENT08GA0028A` → `0195-SGUENT08GA0028A@invoi.ci`
- **Contact Person Management**: Update contact person per invoice while preserving history
- **Line Item Management**: Automatically add description line item at the end
- **Date Validation**: Ensure invoice date is current (prevent post-dating rejections)

### 4. Government Biller Database
- Import and maintain list of government billers from provided JSON/XLS
- Search and autocomplete functionality
- Map agency names to business unit codes

### 5. Invoice History & Tracking
- Track which school/agency each invoice was actually sent to
- Maintain audit trail despite contact name changes
- Store metadata separately from Xero contact records

## Technical Architecture

### Frontend
- **Framework**: Next.js 14+ with App Router
- **UI Components**: Shadcn/ui + Tailwind CSS
- **State Management**: Zustand or React Context
- **Authentication**: NextAuth.js with Xero OAuth provider

### Backend
- **API Routes**: Next.js API routes
- **Database**: PostgreSQL or SQLite for storing:
  - Invoice metadata and history
  - Government biller mappings
  - User preferences and saved transformations
- **ORM**: Prisma

### External Integrations
1. **Xero API**
   - OAuth2 authentication
   - Contacts API for managing recipients
   - Invoices API for fetching and updating invoices
   - Organizations API for multi-tenancy

2. **Peppol Directory API**
   - Query Singapore Peppol directory
   - Cache results to reduce API calls

## Required API Keys & Setup

### Xero API Access
1. Create a Xero app at https://developer.xero.com/myapps
2. App type: Web application
3. Required scopes:
   - `openid`
   - `profile` 
   - `email`
   - `accounting.contacts`
   - `accounting.transactions`
   - `accounting.settings`
   - `offline_access` (for refresh tokens)
4. Set redirect URI: 
   - Development: `http://localhost:3000/api/auth/callback/xero`
   - Production: `https://your-domain.com/api/auth/callback/xero`
5. Store Client ID and Client Secret in `.env.local`

### Environment Variables
```bash
# Required
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
NEXTAUTH_URL=https://your-domain.com  # or http://localhost:3000 for dev
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
DATABASE_URL=file:./dev.db  # SQLite for dev, PostgreSQL for production

# Optional
LOG_LEVEL=info
```

## Current Implementation Status

### ✅ Completed
- **Authentication**: NextAuth.js with Xero OAuth2 provider
- **Database**: Prisma with SQLite, NextAuth models configured
- **Government Billers**: 2,573 agencies imported and indexed
- **Session Management**: JWT tokens with Xero access/refresh tokens
- **Basic UI**: Homepage with login/logout functionality
- **Error Handling**: Custom auth error pages

### 🚧 In Progress
- Organization selector after login
- Xero API client wrapper with token refresh

### 📋 Next Steps
1. Fetch and display Xero organizations
2. Invoice list view with filtering
3. InvoiceNow transformation logic
4. Contact update functionality
5. Batch processing UI

## Workflow

### Standard Invoice Conversion Flow
1. User logs in via Xero OAuth
2. Selects organization from available tenancies
3. Views list of draft/approved invoices
4. Selects invoice(s) to send via InvoiceNow
5. System:
   - Identifies recipient as government agency
   - Fetches appropriate business unit code
   - Transforms contact name and email
   - Adds description line item
   - Updates invoice date to current
   - Shows preview of changes
6. User confirms and sends
7. System updates Xero and logs transaction

## Data Models

### InvoiceTransaction
```typescript
{
  id: string
  xeroInvoiceId: string
  xeroOrgId: string
  originalContactName: string
  transformedContactName: string
  businessUnitCode: string
  agencyName: string
  peppolId: string
  invoiceNowEmail: string
  contactPerson: string
  sentDate: Date
  status: 'pending' | 'sent' | 'failed'
  metadata: JSON
}
```

### GovernmentBiller
```typescript
{
  id: string
  agencyName: string
  businessUnitCode: string
  peppolId: string
  category: string
  parentMinistry: string
  isPayNowEnabled: boolean
}
```

## Validation Rules
1. Invoice date must be today or earlier (no post-dating)
2. Must have at least one line item for description
3. Contact must have valid InvoiceNow email format
4. Business unit code must match agency

## Error Handling
- Clear error messages for validation failures
- Rollback capability if Xero update fails
- Detailed logging of all transformations
- User-friendly error explanations for common InvoiceNow rejections

## Security Considerations
- All Xero API calls server-side only
- Encrypt stored OAuth tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS only in production

## Future Enhancements
- Bulk invoice processing
- Template system for common transformations
- Automated retry for failed submissions
- Integration with email notifications
- Chrome extension for direct Xero UI integration
- Support for other e-invoicing networks