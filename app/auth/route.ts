import { NextRequest, NextResponse } from 'next/server'
import { getShopifyAuthUrl } from '@/lib/shopify'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shop = searchParams.get('shop')

  if (!shop) {
    return NextResponse.json(
      { error: 'Missing shop parameter' },
      { status: 400 }
    )
  }

  // Validate shop domain
  if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
    return NextResponse.json(
      { error: 'Invalid shop domain' },
      { status: 400 }
    )
  }

  const redirectUri = `${process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
  const authUrl = getShopifyAuthUrl(shop, redirectUri)

  return NextResponse.redirect(authUrl)
}

