import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getProducts } from '@/lib/shopify'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shop = searchParams.get('shop')

  if (!shop) {
    return NextResponse.json(
      { error: 'Missing shop parameter' },
      { status: 400 }
    )
  }

  try {
    const store = await prisma.store.findUnique({
      where: { shopDomain: shop },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    const shopifyProducts = await getProducts(shop, store.accessToken)

    // Transform to match our format
    const products = shopifyProducts.map((p: any) => ({
      id: p.id.toString().replace('gid://shopify/Product/', ''),
      title: p.title,
      variants: p.variants.map((v: any) => ({
        id: v.id.toString().replace('gid://shopify/ProductVariant/', ''),
        title: v.title,
        price: v.price,
      })),
    }))

    return NextResponse.json({
      success: true,
      products,
    })
  } catch (error: any) {
    console.error('Get Shopify products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Shopify products', details: error.message },
      { status: 500 }
    )
  }
}

