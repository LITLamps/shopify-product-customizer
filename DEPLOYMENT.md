# Deployment Guide

This guide will help you deploy the Shopify Product Customizer app to production.

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway account (for backend & database)
- Shopify Partner account
- Supabase account (for storage) or AWS account (for S3)

## Step 1: Database Setup (Railway)

1. Go to [Railway](https://railway.app) and create a new project
2. Add a PostgreSQL service
3. Copy the `DATABASE_URL` connection string
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Step 2: Storage Setup

### Option A: Supabase Storage

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a storage bucket named `customizer`
3. Set bucket to public
4. Copy your Supabase URL and keys

### Option B: AWS S3

1. Create an S3 bucket
2. Set bucket policy for public read access
3. Create IAM user with S3 access
4. Copy access key and secret

## Step 3: Shopify App Configuration

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Create a new app
3. Set App URL: `https://yourdomain.com`
4. Set Allowed redirection URL(s): `https://yourdomain.com/auth/callback`
5. Configure webhooks:
   - `app/uninstalled` → `https://yourdomain.com/api/webhooks/app_uninstalled`
6. Copy API Key and Secret

## Step 4: Deploy Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SHOPIFY_SCOPES` (comma-separated)
   - `SHOPIFY_REDIRECT_URI` (your Vercel URL + `/auth/callback`)
   - `SHOPIFY_APP_URL` (your Vercel URL)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WEBHOOK_SECRET` (generate a random string)
4. Deploy

## Step 5: Deploy Backend (Railway - Optional)

If you want to run a separate backend:

1. Add Node.js service to Railway project
2. Set environment variables (same as Vercel)
3. Deploy

## Step 6: Update Shopify App URLs

1. Update your Shopify app settings with the production URLs
2. Test the OAuth flow
3. Install on a development store

## Environment Variables Reference

```bash
# Database
DATABASE_URL=postgresql://...

# Shopify
SHOPIFY_API_KEY=your_key
SHOPIFY_API_SECRET=your_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders
SHOPIFY_REDIRECT_URI=https://yourdomain.com/auth/callback
SHOPIFY_APP_URL=https://yourdomain.com

# Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Storage (AWS S3 - Alternative)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket

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

- **OAuth errors**: Check redirect URI matches exactly
- **Database errors**: Verify DATABASE_URL and run migrations
- **Storage errors**: Check bucket permissions and keys
- **Webhook errors**: Verify HMAC signature validation

