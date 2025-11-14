# Shopify Product Customizer App

A full-stack Shopify app that allows merchants to offer product customization to their customers. Customers can upload or generate custom designs, preview them in real-time, and checkout directly through Shopify.

## Features

- 🔐 Shopify OAuth 2.0 authentication
- 🛍️ Product linking and management
- 🎨 Customization interface with image upload/generation
- 💳 Direct checkout via Shopify Storefront API
- 📦 Design storage and management
- 🔔 Webhook handling for app lifecycle

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes (Serverless Functions)
- **Database:** PostgreSQL with Prisma ORM
- **Storage:** Supabase Storage
- **Hosting:** Vercel (full-stack deployment)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Shopify Partner account
- Supabase account (for storage)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd shopify-customizer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- Database URL
- Shopify API keys
- Storage credentials
- Webhook secret

4. Set up the database:
```bash
npx prisma db push
# or
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Shopify App Setup

1. Create a new app in your [Shopify Partner Dashboard](https://partners.shopify.com)
2. Set the App URL to: `https://yourdomain.com`
3. Set the Allowed redirection URL(s) to: `https://yourdomain.com/auth/callback`
4. Configure webhooks:
   - `app/uninstalled` → `https://yourdomain.com/api/webhooks/app_uninstalled`
5. Install the app on a development store to test

## Project Structure

```
shopify-customizer/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # OAuth routes
│   ├── dashboard/         # Merchant dashboard
│   └── apps/              # Customer-facing pages
├── components/            # React components
├── lib/                   # Utilities and helpers
├── prisma/                # Database schema
└── public/                # Static assets
```

## API Endpoints

- `GET /auth` - Initiate Shopify OAuth
- `GET /auth/callback` - OAuth callback handler
- `POST /api/save-design` - Save custom design
- `POST /api/create-checkout` - Create Shopify checkout
- `POST /api/webhooks/app_uninstalled` - Handle app uninstall

## Deployment

### Deploy to Vercel

Since this is a Next.js application, both frontend and backend (API routes) are deployed together on Vercel. Next.js API routes work natively as serverless functions.

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Set up a PostgreSQL database (Vercel Postgres, Supabase, or external)
4. Deploy
5. Run database migrations: `npx prisma migrate deploy`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## License

MIT

