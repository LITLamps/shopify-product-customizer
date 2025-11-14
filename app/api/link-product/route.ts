import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const linkProductSchema = z.object({
  shop: z.string(),
  productId: z.string(),
  variantId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = linkProductSchema.parse(body)

    const store = await prisma.store.findUnique({
      where: { shopDomain: validated.shop },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    const product = await prisma.product.upsert({
      where: {
        shopId_shopProductId: {
          shopId: store.id,
          shopProductId: validated.productId,
        },
      },
      update: {
        shopVariantId: validated.variantId,
        enabled: true,
      },
      create: {
        shopId: store.id,
        shopProductId: validated.productId,
        shopVariantId: validated.variantId,
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error: any) {
    console.error('Link product error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to link product', details: error.message },
      { status: 500 }
    )
  }
}

