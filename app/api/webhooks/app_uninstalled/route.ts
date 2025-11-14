import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhook } from '@/lib/shopify'

export async function POST(request: NextRequest) {
  try {
    const hmac = request.headers.get('x-shopify-hmac-sha256')
    const shop = request.headers.get('x-shopify-shop-domain')
    const body = await request.text()

    if (!hmac || !shop) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      )
    }

    // Verify webhook
    const secret = process.env.WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET!
    const isValid = verifyWebhook(hmac, body, secret)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)

    // Delete store and all related data (cascade will handle related records)
    await prisma.store.deleteMany({
      where: { shopDomain: shop },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

