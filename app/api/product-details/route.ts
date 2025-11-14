import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shop = searchParams.get('shop')
  const productId = searchParams.get('productId')

  if (!shop || !productId) {
    return NextResponse.json(
      { error: 'Missing shop or productId parameter' },
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

    const product = await prisma.product.findFirst({
      where: {
        shopId: store.id,
        id: parseInt(productId),
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        shopId: store.id,
        shopProductId: product.shopProductId,
        shopVariantId: product.shopVariantId,
      },
    })
  } catch (error: any) {
    console.error('Get product details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product details', details: error.message },
      { status: 500 }
    )
  }
}

