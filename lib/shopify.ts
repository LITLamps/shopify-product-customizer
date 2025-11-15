import '@shopify/shopify-api/adapters/node'
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api'
import { restResources } from '@shopify/shopify-api/rest/admin/2024-01'

const apiKey = process.env.SHOPIFY_API_KEY!
const apiSecret = process.env.SHOPIFY_API_SECRET!
const scopes = process.env.SHOPIFY_SCOPES?.split(',') || []
const hostName = process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, '') || 'localhost:3000'

export const shopify = shopifyApi({
  apiKey,
  apiSecretKey: apiSecret,
  scopes,
  hostName,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  restResources,
})

export function getShopifyAuthUrl(shop: string, redirectUri: string): string {
  if (!apiKey) {
    throw new Error('SHOPIFY_API_KEY is not configured')
  }
  
  if (!scopes || scopes.length === 0) {
    throw new Error('SHOPIFY_SCOPES is not configured')
  }

  // Generate a random state for security
  const state = Math.random().toString(36).substring(7)
  
  // Validate redirect URI format before building params
  try {
    new URL(redirectUri)
  } catch {
    throw new Error(`Invalid redirect URI: ${redirectUri}`)
  }

  // URLSearchParams will automatically URL-encode the redirect_uri
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes.join(','),
    redirect_uri: redirectUri,
    state,
  })

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`
}

export async function validateAuthCallback(
  shop: string,
  code: string
): Promise<{ accessToken: string; scope: string }> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OAuth token exchange failed: ${errorText}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    scope: data.scope,
  }
}

export async function getStorefrontToken(shop: string, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://${shop}/admin/api/2024-01/storefront_access_tokens.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        storefront_access_token: {
          title: 'Product Customizer App',
        },
      }),
    })

    if (!response.ok) {
      // Try to get existing token
      const listResponse = await fetch(`https://${shop}/admin/api/2024-01/storefront_access_tokens.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      })
      const listData = await listResponse.json()
      if (listData.storefront_access_tokens?.length > 0) {
        return listData.storefront_access_tokens[0].access_token
      }
      return null
    }

    const data = await response.json()
    return data.storefront_access_token?.access_token || null
  } catch (error) {
    console.error('Error creating storefront token:', error)
    return null
  }
}

export async function createCheckout(
  shop: string,
  storefrontToken: string,
  variantId: string,
  quantity: number = 1,
  customAttributes: Array<{ key: string; value: string }> = []
): Promise<string> {
  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          webUrl
        }
        userErrors {
          message
        }
      }
    }
  `

  const input = {
    lineItems: [
      {
        variantId,
        quantity,
        customAttributes,
      },
    ],
  }

  const response = await fetch(`https://${shop}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input },
    }),
  })

  const data = await response.json()

  if (data.errors) {
    throw new Error(JSON.stringify(data.errors))
  }

  if (data.data.checkoutCreate.userErrors?.length > 0) {
    throw new Error(JSON.stringify(data.data.checkoutCreate.userErrors))
  }

  return data.data.checkoutCreate.checkout.webUrl
}

export async function getProducts(shop: string, accessToken: string) {
  const response = await fetch(`https://${shop}/admin/api/2024-01/products.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  })

  const data = await response.json()
  return data.products || []
}

export function verifyWebhook(hmac: string, body: string, secret: string): boolean {
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')
  return hash === hmac
}

