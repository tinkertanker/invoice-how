# InvoiceNow-Xero Integration - Implementation Roadmap

## Phase 1: Foundation Setup ✅
- [x] Create project specification (CLAUDE.md)
- [x] Define technical architecture
- [x] Initialize Next.js project with TypeScript
- [x] Set up development environment
- [x] Configure ESLint and Prettier
- [x] Set up Git repository

## Phase 2: External Service Setup ✅
- [x] Register Xero app at https://developer.xero.com/myapps
  - [x] Configure OAuth2 settings
  - [x] Set redirect URIs
  - [x] Note Client ID and Secret
- [x] Set up environment variables (.env.local)
- [ ] Research Peppol Directory API access
  - [ ] Check if API key needed for https://peppoldirectory.sg
  - [ ] Test API endpoints or web scraping approach

## Phase 3: Database & Data Layer ✅
- [x] Set up Prisma with PostgreSQL/SQLite
- [x] Create database schema:
  - [x] InvoiceTransaction table
  - [x] GovernmentBiller table  
  - [x] User preferences table (via NextAuth)
- [x] Import government biller data:
  - [x] Parse MinistryBoard JSON file
  - [x] Seed database with 2,573 billers

## Phase 4: Authentication System ✅
- [x] Install and configure NextAuth.js
- [x] Create custom Xero OAuth provider
- [x] Implement authentication pages:
  - [x] Login page
  - [x] OAuth callback handler
  - [ ] Organization selector
- [x] Set up session management
- [ ] Test multi-tenancy support

## Phase 5: Xero API Integration
- [ ] Create Xero API client wrapper
- [ ] Implement core API functions:
  - [ ] Fetch organizations
  - [ ] Fetch invoices (with filtering)
  - [ ] Fetch contacts
  - [ ] Update contact details
  - [ ] Update invoice details
- [ ] Handle OAuth token refresh
- [ bowling rate limiting and error handling

## Phase 6: Core Business Logic
- [ ] Create InvoiceNow transformation service:
  - [ ] Contact name transformation (prepend business unit codes)
  - [ ] Email address conversion (Peppol ID to InvoiceNow format)
  - [ ] Line item management (add description line)
  - [ ] Date validation (prevent post-dating)
- [ ] Implement government agency matcher
- [ ] Create Peppol directory integration:
  - [ ] Query function
  - [ ] Result caching
  - [ ] Format transformation

## Phase 7: User Interface
- [ ] Install Shadcn/ui components
- [ ] Create layout components:
  - [ ] Navigation header
  - [ ] Sidebar with organization info
  - [ ] Footer
- [ ] Build main pages:
  - [ ] Dashboard (invoice list)
  - [ ] Invoice detail/preview
  - [ ] Transformation preview
  - [ ] Settings page
- [ ] Implement invoice workflows:
  - [ ] Invoice selection UI
  - [ ] Transformation preview modal
  - [ ] Confirmation dialog
  - [ ] Success/error notifications

## Phase 8: Invoice Processing Pipeline
- [ ] Create invoice processing queue
- [ ] Implement transformation pipeline:
  - [ ] Validate invoice data
  - [ ] Apply InvoiceNow transformations
  - [ ] Preview changes
  - [ ] Update Xero
  - [ ] Log transaction
- [ ] Add error recovery mechanisms
- [ ] Create audit logging

## Phase 9: Testing & Validation
- [ ] Unit tests for transformation logic
- [ ] Integration tests for Xero API
- [ ] E2E tests for critical workflows
- [ ] Test with real government biller codes
- [ ] Validate InvoiceNow email formats
- [ ] Test error scenarios:
  - [ ] Post-dated invoices
  - [ ] Missing description line items
  - [ ] Invalid business unit codes

## Phase 10: Production Preparation
- [ ] Security audit:
  - [ ] API key storage
  - [ ] OAuth token encryption
  - [ ] Input validation
  - [ ] XSS prevention
- [ ] Performance optimization:
  - [ ] Database queries
  - [ ] API response caching
  - [ ] Frontend bundle size
- [ ] Documentation:
  - [ ] User guide
  - [ ] API documentation
  - [ ] Deployment guide
- [ ] Set up monitoring and logging
- [ ] Configure production environment

## Phase 11: Deployment
- [ ] Choose hosting platform (Vercel/Railway/AWS)
- [ ] Set up CI/CD pipeline
- [ ] Configure production database
- [ ] Set up domain and SSL
- [ ] Deploy to staging environment
- [ ] User acceptance testing
- [ ] Deploy to production

## Future Enhancements (Post-MVP)
- [ ] Chrome extension for Xero UI
- [ ] Bulk invoice processing
- [ ] Email notification system
- [ ] Invoice templates
- [ ] Advanced filtering and search
- [ ] Export/import functionality
- [ ] Support for other e-invoice networks
- [ ] Mobile responsive design improvements

## Current Sprint Focus

### ✅ Completed (Week 1)
- Foundation setup with Next.js 14
- Xero OAuth authentication
- Government biller database (2,573 agencies)
- Basic UI with login/logout

### 🎯 Next Priority (Week 2)
**Phase 5: Xero API Integration**
1. Create Xero API client with token refresh
2. Fetch organizations after login
3. Display invoice list
4. Implement contact fetching

### Upcoming (Week 3-4)
**Phase 6: InvoiceNow Transformations**
- Field mapping logic
- Validation rules
- Preview UI

## Blockers & Dependencies
- ✅ ~~Need Xero developer account and app registration~~ (Done)
- ⚠️ Verify Peppol Directory API access method
- ⚠️ Confirm exact InvoiceNow validation rules with IMDA documentation
- ⚠️ Test with actual government agency invoices
- ⚠️ Handle Xero's 2-app limit for uncertified apps

## Notes
- Start with a single organization first, then add multi-tenancy
- Build transformation logic with extensive logging for debugging
- Consider starting with read-only mode before implementing updates
- Keep transformation rules configurable for easy updates