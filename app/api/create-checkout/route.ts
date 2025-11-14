import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCheckout } from '@/lib/shopify'
import { z } from 'zod'

const checkoutSchema = z.object({
  shopId: z.number(),
  productId: z.number(),
  designId: z.string(),
  variantId: z.string(),
  quantity: z.number().min(1).default(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = checkoutSchema.parse(body)

    // Get store and design
    const store = await prisma.store.findUnique({
      where: { id: validated.shopId },
    })

    if (!store || !store.storefrontToken) {
      return NextResponse.json(
        { error: 'Store not found or storefront token missing' },
        { status: 404 }
      )
    }

    const design = await prisma.design.findUnique({
      where: { id: validated.designId },
    })

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    // Ensure variant ID is in GID format
    let variantId = validated.variantId
    if (!variantId.startsWith('gid://')) {
      variantId = `gid://shopify/ProductVariant/${variantId}`
    }

    // Create checkout with custom attributes
    const checkoutUrl = await createCheckout(
      store.shopDomain,
      store.storefrontToken,
      variantId,
      validated.quantity,
      [
        { key: 'design_id', value: design.id },
        { key: 'design_preview', value: design.imageUrl },
      ]
    )

    return NextResponse.json({
      success: true,
      checkoutUrl,
    })
  } catch (error: any) {
    console.error('Create checkout error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout', details: error.message },
      { status: 500 }
    )
  }
}

