import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shop = searchParams.get('shop')

  // Get the app URL - same logic as auth route
  let appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL
  
  if (!appUrl) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || request.nextUrl.host
    appUrl = `${protocol}://${host}`
  }

  appUrl = appUrl.replace(/\/$/, '')
  const redirectUri = `${appUrl}/auth/callback`

  // Check environment variables (without exposing secrets)
  const hasApiKey = !!process.env.SHOPIFY_API_KEY
  const hasApiSecret = !!process.env.SHOPIFY_API_SECRET
  const scopes = process.env.SHOPIFY_SCOPES || 'NOT SET'
  const apiKeyPrefix = process.env.SHOPIFY_API_KEY?.substring(0, 8) || 'NOT SET'

  return NextResponse.json({
    debug: {
      currentUrl: request.url,
      appUrl,
      redirectUri,
      shop: shop || 'not provided',
      environment: {
        hasApiKey,
        hasApiSecret,
        scopes,
        apiKeyPrefix: `${apiKeyPrefix}...`,
        SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || 'NOT SET',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
      },
      expectedShopifyConfig: {
        appUrl: appUrl,
        redirectUri: redirectUri,
        note: 'These must match exactly in Shopify Partner Dashboard',
      },
      instructions: [
        '1. Go to https://partners.shopify.com',
        '2. Select your app',
        '3. Go to App setup',
        `4. Set App URL to: ${appUrl}`,
        `5. Set Allowed redirection URL(s) to: ${redirectUri}`,
        '6. Save and redeploy on Vercel',
        '7. Make sure SHOPIFY_APP_URL in Vercel matches exactly',
      ],
    },
  }, { status: 200 })
}

