# Project Structure

This document outlines the structure of the Shopify Product Customizer app.

```
shopify-customizer/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── create-checkout/      # Creates Shopify checkout
│   │   ├── link-product/         # Links Shopify product to app
│   │   ├── product-details/      # Gets product details
│   │   ├── products/             # Lists linked products
│   │   ├── save-design/          # Saves custom design
│   │   ├── shopify-products/     # Fetches products from Shopify
│   │   └── webhooks/
│   │       └── app_uninstalled/  # Handles app uninstall webhook
│   ├── apps/
│   │   └── customize/            # Customer-facing customization page
│   ├── auth/
│   │   ├── route.ts              # OAuth initiation
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   ├── dashboard/                # Merchant dashboard
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── lib/                          # Utilities and helpers
│   ├── prisma.ts                # Prisma client instance
│   ├── shopify.ts               # Shopify API utilities
│   └── storage.ts               # Storage utilities (Supabase)
├── prisma/
│   └── schema.prisma            # Database schema
├── .env.example                 # Environment variables template
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── DEPLOYMENT.md                # Deployment guide
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── PROJECT_STRUCTURE.md        # This file
├── QUICKSTART.md               # Quick start guide
├── README.md                   # Main documentation
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── vercel.json                 # Vercel deployment config
```

## Key Files Explained

### API Routes

- **`/api/create-checkout`**: Creates a Shopify checkout via Storefront API with custom attributes
- **`/api/save-design`**: Saves uploaded/generated images to storage and creates design records
- **`/api/link-product`**: Links a Shopify product to the app for customization
- **`/api/products`**: Lists all products linked to a store
- **`/api/shopify-products`**: Fetches products from Shopify Admin API
- **`/api/product-details`**: Gets details of a specific linked product
- **`/api/webhooks/app_uninstalled`**: Handles app uninstall webhook

### Pages

- **`/`**: Landing/marketing page
- **`/dashboard`**: Merchant dashboard for managing products
- **`/apps/customize`**: Customer-facing product customization interface
- **`/auth`**: Initiates Shopify OAuth flow
- **`/auth/callback`**: Handles OAuth callback and stores tokens

### Libraries

- **`lib/prisma.ts`**: Singleton Prisma client instance
- **`lib/shopify.ts`**: Shopify API helpers (OAuth, checkout, products, webhooks)
- **`lib/storage.ts`**: Image storage utilities (Supabase)

### Database Schema

- **Store**: Shopify store information and tokens
- **Product**: Linked Shopify products
- **Design**: Custom designs created by customers

## Data Flow

1. **Installation**: Merchant installs app → OAuth flow → Store record created
2. **Product Linking**: Merchant links product → Product record created
3. **Customization**: Customer uploads image → Design saved → Checkout created
4. **Order**: Order contains custom attributes with design ID and preview URL

## Environment Variables

See `.env.example` for all required environment variables.

## Next Steps

- Add image generation (AI integration)
- Implement App Embed Blocks
- Add order fulfillment automation
- Build analytics dashboard
- Add billing/subscription support

