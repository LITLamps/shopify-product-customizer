import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      include: {
        products: {
          include: {
            _count: {
              select: { designs: true },
            },
          },
        },
      },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      products: store.products,
    })
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    )
  }
}

