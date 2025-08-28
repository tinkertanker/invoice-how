# InvoiceNow-Xero Integration

Simplifies invoicing Singapore government agencies through Xero by handling the InvoiceNow (Peppol) field requirements automatically.

## Problem It Solves

Singapore government agencies require specific field formats when receiving e-invoices:
- Business unit codes must be prepended to contact names
- Special email format required (`0195-SGUENT08GA0028A@invoi.ci`)
- Extra line item needed for invoice description
- No post-dating allowed

This app handles these transformations automatically.

## Setup

1. **Clone and install**
```bash
git clone https://github.com/tinkertanker/invoice-how.git
cd invoice-how
npm install
```

2. **Configure Xero App**
   - Create app at https://developer.xero.com/myapps
   - Add redirect URI: `https://your-domain/api/auth/callback/xero`
   - Copy Client ID and Secret

3. **Set environment variables**
```bash
cp .env.example .env.local
# Add your Xero credentials to .env.local
```

4. **Initialize database**
```bash
npm run db:push
npm run db:seed  # Loads 2,573 government agencies
```

5. **Run**
```bash
npm run dev
```

## Features

- Xero OAuth login
- Automatic field transformation for InvoiceNow
- Government agency database with business unit codes
- Invoice validation before sending
- Transaction history tracking

## Tech Stack

- Next.js 14 with TypeScript
- NextAuth.js for Xero OAuth
- Prisma with SQLite/PostgreSQL
- Tailwind CSS

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:studio    # View database
```

## Status

Currently implements:
- ✅ Xero authentication
- ✅ Government biller database
- 🚧 Invoice fetching and transformation
- 📋 Batch processing

See [TODO.md](TODO.md) for roadmap.