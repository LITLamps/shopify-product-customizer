# Quick Start Guide

Get your Shopify Product Customizer app up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- PostgreSQL database (local or cloud)
- Shopify Partner account
- Supabase account (for storage) or AWS account (for S3)

## Step 1: Clone and Install

```bash
cd shopify-customizer
npm install
```

## Step 2: Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

### Database
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/shopify_customizer"
```

### Shopify App
1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Create a new app
3. Copy your API Key and Secret
4. Set App URL: `http://localhost:3000`
5. Set Redirect URI: `http://localhost:3000/auth/callback`

```bash
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders
SHOPIFY_REDIRECT_URI=http://localhost:3000/auth/callback
SHOPIFY_APP_URL=http://localhost:3000
```

### Storage (Supabase - Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Create a storage bucket named `customizer`
3. Set it to public
4. Copy your project URL and keys

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Webhook Secret
Generate a random string:
```bash
WEBHOOK_SECRET=your_random_secret_here
```

## Step 3: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init
```

## Step 4: Set Up Supabase Storage

1. Go to your Supabase project
2. Navigate to Storage
3. Create a new bucket named `customizer`
4. Set it to **public**
5. Configure CORS if needed

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Install the App

1. Go to your Shopify Partner Dashboard
2. Find your app
3. Click "Install app" on a development store
4. Or visit: `http://localhost:3000/auth?shop=your-store.myshopify.com`

## Step 7: Link a Product

1. After installation, you'll be redirected to the dashboard
2. Click "Fetch Shopify Products"
3. Select a product and variant
4. Click "Link"

## Step 8: Test Customization

1. Visit: `http://localhost:3000/apps/customize?shop=your-store.myshopify.com&productId=1`
2. Upload an image
3. Click "Add to Cart & Checkout"
4. You'll be redirected to Shopify checkout

## Troubleshooting

### Database Connection Error
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials

### OAuth Errors
- Verify redirect URI matches exactly in Shopify app settings
- Check API key and secret are correct
- Ensure shop domain format is correct (e.g., `store.myshopify.com`)

### Storage Upload Errors
- Verify Supabase bucket exists and is public
- Check service role key has proper permissions
- Verify bucket name is `customizer`

### Checkout Creation Errors
- Ensure storefront token is created
- Verify variant ID is correct
- Check product is linked properly

## Next Steps

- Customize the UI in `app/apps/customize/page.tsx`
- Add image generation (DALL-E, Stable Diffusion, etc.)
- Implement App Embed Blocks
- Add order attachment functionality
- Set up production deployment (see DEPLOYMENT.md)

## Need Help?

- Check the [README.md](./README.md) for more details
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Check Shopify API documentation for advanced features

