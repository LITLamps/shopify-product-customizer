import { NextRequest, NextResponse } from 'next/server'
import { validateAuthCallback, getStorefrontToken } from '@/lib/shopify'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!shop || !code) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    // Validate and get access token
    const { accessToken } = await validateAuthCallback(shop, code)

    // Get or create storefront token
    const storefrontToken = await getStorefrontToken(shop, accessToken)

    // Save or update store in database
    await prisma.store.upsert({
      where: { shopDomain: shop },
      update: {
        accessToken,
        storefrontToken,
        installedAt: new Date(),
      },
      create: {
        shopDomain: shop,
        accessToken,
        storefrontToken,
        installedAt: new Date(),
      },
    })

    // Redirect to dashboard
    const dashboardUrl = new URL('/dashboard', request.url)
    dashboardUrl.searchParams.set('shop', shop)
    
    return NextResponse.redirect(dashboardUrl.toString())
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 500 }
    )
  }
}

