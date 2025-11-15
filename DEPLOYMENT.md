# Deployment Guide

This guide will help you deploy the Shopify Product Customizer app to production on Vercel.

## Prerequisites

- GitHub account
- Vercel account
- Shopify Partner account
- PostgreSQL database (Vercel Postgres, Supabase, or any external Postgres)
- Supabase account (for storage)

## Step 1: Database Setup

Choose one of the following options:

### Option A: Vercel Postgres (Recommended)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select an existing one
3. Go to the Storage tab
4. Create a Postgres database
5. Copy the `DATABASE_URL` connection string from the database settings
6. Note: Vercel Postgres uses connection pooling, which is perfect for serverless functions

### Option B: Supabase Postgres

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings → Database
3. Copy the connection string (use the connection pooling URL for serverless)
4. The connection pooling URL typically looks like: `postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true`

### Option C: External PostgreSQL

1. Set up a PostgreSQL database (AWS RDS, DigitalOcean, etc.)
2. Copy the `DATABASE_URL` connection string
3. For serverless functions, consider using a connection pooler like PgBouncer

## Step 2: Storage Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a storage bucket named `customizer`
3. Set bucket to public
4. Copy your Supabase URL and keys:
   - Project URL: `https://xxx.supabase.co`
   - Anon key: From Settings → API
   - Service role key: From Settings → API (keep this secret!)

## Step 3: Shopify App Configuration

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Create a new app (or edit existing app)
3. **Important OAuth Settings** (must match exactly):
   - **App URL**: `https://your-vercel-app.vercel.app` (or your custom domain)
     - No trailing slash
     - Must use `https://`
   - **Allowed redirection URL(s)**: `https://your-vercel-app.vercel.app/auth/callback`
     - Must match exactly (case-sensitive, no trailing slash)
     - This is the OAuth callback URL
   - **Note**: The redirect URI in your Vercel environment variable `SHOPIFY_APP_URL` must match this exactly

4. Configure webhooks:
   - `app/uninstalled` → `https://your-vercel-app.vercel.app/api/webhooks/app_uninstalled`

5. Copy API Key and Secret (these go into Vercel environment variables)

6. Configure required scopes:
   - `read_products`
   - `write_products`
   - `read_orders`
   - `write_orders`

**Critical**: If you get "accounts.shopify.com refused to connect" error, check:
- The redirect URI in Shopify app settings matches exactly: `https://your-vercel-app.vercel.app/auth/callback`
- The `SHOPIFY_APP_URL` environment variable in Vercel is set to: `https://your-vercel-app.vercel.app` (no trailing slash)
- Both URLs use the same protocol (https) and domain

## Step 4: Deploy to Vercel

Since this is a Next.js application, both frontend and backend (API routes) will be deployed together on Vercel. Next.js API routes work natively as serverless functions on Vercel.

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js framework
6. Configure build settings (usually auto-detected):
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
7. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (from Step 1)
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SHOPIFY_SCOPES` (comma-separated, e.g., `read_products,write_products,read_orders,write_orders`)
   - `SHOPIFY_REDIRECT_URI` (your Vercel URL + `/auth/callback`)
   - `SHOPIFY_APP_URL` (your Vercel URL)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WEBHOOK_SECRET` (generate a random string)
   
8. Deploy the project
9. After deployment, run database migrations:
   ```bash
   # Set DATABASE_URL environment variable first
   export DATABASE_URL="your-database-url"
   npx prisma migrate deploy
   ```
   Or use Vercel CLI:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

## Step 5: Update Shopify App URLs

1. After deployment, update your Shopify app settings with your Vercel production URLs
2. Set:
   - App URL: `https://your-vercel-app.vercel.app`
   - Allowed redirection URL(s): `https://your-vercel-app.vercel.app/auth/callback`
   - Webhook URL: `https://your-vercel-app.vercel.app/api/webhooks/app_uninstalled`
3. Test the OAuth flow
4. Install on a development store

## Step 6: Run Database Migrations

After your first deployment, you need to run database migrations to create the necessary tables:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Option 2: Directly with DATABASE_URL
DATABASE_URL="your-database-url" npx prisma migrate deploy
```

## Environment Variables Reference

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Shopify
SHOPIFY_API_KEY=your_key
SHOPIFY_API_SECRET=your_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders
SHOPIFY_REDIRECT_URI=https://your-vercel-app.vercel.app/auth/callback
SHOPIFY_APP_URL=https://your-vercel-app.vercel.app

# Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Security
WEBHOOK_SECRET=random_string_here
```

## Testing

1. Install app on development store
2. Link a product in dashboard
3. Test customization flow
4. Verify checkout works
5. Check webhook handling

## Troubleshooting

- **OAuth errors**: Check redirect URI matches exactly (including protocol and trailing slashes)
- **Database errors**: Verify DATABASE_URL and run migrations. For serverless, ensure you're using connection pooling
- **Storage errors**: Check bucket permissions and keys
- **Webhook errors**: Verify HMAC signature validation
- **Build errors**: Check that all environment variables are set in Vercel dashboard
- **Cold starts**: First request may be slower due to serverless cold starts. This is normal

## Additional Notes

### Vercel Serverless Functions

- Next.js API routes automatically become serverless functions on Vercel
- Each API route has a 10-second timeout on the Hobby plan, 60 seconds on Pro
- Database connections should use connection pooling for better performance
- Consider using `@vercel/postgres` or connection poolers for production

### Database Connection Pooling

For serverless functions, it's important to use connection pooling to avoid exhausting database connections:

- **Vercel Postgres**: Automatically uses connection pooling
- **Supabase**: Use the connection pooling URL (port 6543)
- **Other providers**: Use PgBouncer or similar connection pooler

### Custom Domain

1. Go to your Vercel project settings
2. Navigate to Domains
3. Add your custom domain
4. Update Shopify app URLs with your custom domain
5. Update environment variables if needed
