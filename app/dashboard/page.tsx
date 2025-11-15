'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  variants: Array<{ id: string; title: string; price: string }>
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const shop = searchParams.get('shop')
  const [products, setProducts] = useState<Product[]>([])
  const [linkedProducts, setLinkedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLinkedProducts = async () => {
    if (!shop) {
      setError('Shop parameter missing. Please install the app first by visiting it from your Shopify Admin panel.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/products?shop=${shop}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setLinkedProducts(data.products || [])
    } catch (err: any) {
      console.error('Error fetching linked products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinkedProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop])

  const handleLinkProduct = async (productId: string, variantId: string) => {
    try {
      const response = await fetch('/api/link-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop, productId, variantId }),
      })

      if (!response.ok) throw new Error('Failed to link product')
      
      await fetchLinkedProducts()
      alert('Product linked successfully!')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleFetchShopifyProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/shopify-products?shop=${shop}`)
      if (!response.ok) throw new Error('Failed to fetch Shopify products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Shop: {shop}</p>
        </div>

        {!shop && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold mb-2">Shop Parameter Missing</h3>
            <p className="mb-2">
              To use the dashboard, you need to install the app first. The app must be accessed through your Shopify Admin panel.
            </p>
            <p className="text-sm">
              <strong>To install:</strong> Go to your Shopify Admin → Apps → Visit the app store or search for this app.
            </p>
          </div>
        )}

        {error && shop && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {shop && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Linked Products</h2>
              {linkedProducts.length === 0 ? (
                <p className="text-gray-500">No products linked yet.</p>
              ) : (
                <div className="space-y-4">
                  {linkedProducts.map((product) => (
                    <div key={product.id} className="border rounded p-4">
                      <p className="font-semibold">Product ID: {product.shopProductId}</p>
                      <p className="text-sm text-gray-600">Variant: {product.shopVariantId}</p>
                      <Link
                        href={`/apps/customize?shop=${shop}&productId=${product.id}`}
                        className="text-indigo-600 hover:underline mt-2 inline-block"
                      >
                        View Customizer →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Link New Product</h2>
              <button
                onClick={handleFetchShopifyProducts}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mb-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching...' : 'Fetch Shopify Products'}
              </button>

              {products.length > 0 && (
                <div className="space-y-4 mt-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded p-4">
                      <h3 className="font-semibold mb-2">{product.title}</h3>
                      <div className="space-y-2">
                        {product.variants.map((variant) => (
                          <div key={variant.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {variant.title} - ${variant.price}
                            </span>
                            <button
                              onClick={() => handleLinkProduct(product.id, variant.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Link
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

