import { NextRequest, NextResponse } from 'next/server'
import { getShopifyAuthUrl } from '@/lib/shopify'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shop = searchParams.get('shop')

  if (!shop) {
    // Redirect back to home with error message
    const homeUrl = new URL('/', request.url)
    homeUrl.searchParams.set('error', 'missing-shop')
    return NextResponse.redirect(homeUrl.toString())
  }

  // Validate shop domain
  if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
    // Redirect back to home with error message
    const homeUrl = new URL('/', request.url)
    homeUrl.searchParams.set('error', 'invalid-shop')
    return NextResponse.redirect(homeUrl.toString())
  }

  // Get the app URL - construct from request if not in env
  let appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL
  
  // If not in env, construct from request
  if (!appUrl) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || request.nextUrl.host
    appUrl = `${protocol}://${host}`
  }

  // Ensure no trailing slash
  appUrl = appUrl.replace(/\/$/, '')
  
  // Construct redirect URI
  const redirectUri = `${appUrl}/auth/callback`
  
  // Log for debugging (in production, check Vercel logs)
  console.log('OAuth Init:', {
    shop,
    appUrl,
    redirectUri,
    hasApiKey: !!process.env.SHOPIFY_API_KEY,
    hasScopes: !!process.env.SHOPIFY_SCOPES,
  })
  
  // Validate that we have the required environment variables
  if (!process.env.SHOPIFY_API_KEY) {
    console.error('SHOPIFY_API_KEY is not set')
    return NextResponse.json(
      { 
        error: 'Server configuration error: SHOPIFY_API_KEY not set',
        debug: {
          appUrl,
          redirectUri,
          instructions: 'Set SHOPIFY_API_KEY in Vercel environment variables. Check /api/debug-oauth for more info.',
        },
      },
      { status: 500 }
    )
  }

  if (!process.env.SHOPIFY_SCOPES) {
    console.error('SHOPIFY_SCOPES is not set')
    return NextResponse.json(
      { 
        error: 'Server configuration error: SHOPIFY_SCOPES not set',
        debug: {
          appUrl,
          redirectUri,
          instructions: 'Set SHOPIFY_SCOPES in Vercel environment variables. Example: read_products,write_products',
        },
      },
      { status: 500 }
    )
  }

  try {
    const authUrl = getShopifyAuthUrl(shop, redirectUri)
    
    // Log the auth URL being generated (for debugging)
    console.log('Generated OAuth URL:', authUrl.replace(process.env.SHOPIFY_API_KEY || '', '[REDACTED]'))
    
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate authorization URL', 
        details: error.message,
        debug: {
          appUrl,
          redirectUri,
          shop,
          instructions: 'Check /api/debug-oauth to verify configuration',
        },
      },
      { status: 500 }
    )
  }
}

