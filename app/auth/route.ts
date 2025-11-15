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

  const redirectUri = `${process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
  const authUrl = getShopifyAuthUrl(shop, redirectUri)

  return NextResponse.redirect(authUrl)
}

