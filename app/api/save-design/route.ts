import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/storage'
import { z } from 'zod'

const saveDesignSchema = z.object({
  shopId: z.number(),
  productId: z.number(),
  imageData: z.string(), // base64
  metadata: z.record(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = saveDesignSchema.parse(body)

    // Upload image to storage
    const imageUrl = await uploadImage(
      validated.imageData,
      `design-${Date.now()}.png`,
      'designs'
    )

    // Create design record
    const design = await prisma.design.create({
      data: {
        shopId: validated.shopId,
        productId: validated.productId,
        imageUrl,
        metadata: validated.metadata || {},
      },
    })

    return NextResponse.json({
      success: true,
      design: {
        id: design.id,
        imageUrl: design.imageUrl,
      },
    })
  } catch (error: any) {
    console.error('Save design error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save design', details: error.message },
      { status: 500 }
    )
  }
}

