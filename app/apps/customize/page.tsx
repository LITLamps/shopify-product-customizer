'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface ProductDetails {
  id: number
  shopId: number
  shopProductId: string
  shopVariantId: string | null
}

function CustomizeContent() {
  const searchParams = useSearchParams()
  const shop = searchParams.get('shop')
  const productId = searchParams.get('productId')
  
  const [imageData, setImageData] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProductDetails = async () => {
    if (!shop || !productId) return
    
    try {
      setLoadingProduct(true)
      const response = await fetch(`/api/product-details?shop=${shop}&productId=${productId}`)
      if (!response.ok) throw new Error('Failed to fetch product details')
      const data = await response.json()
      setProductDetails(data.product)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingProduct(false)
    }
  }

  useEffect(() => {
    if (shop && productId) {
      fetchProductDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop, productId])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setImageData(result)
      setPreviewUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerateImage = async () => {
    // Placeholder for image generation (like Lit Lamps Generator)
    // You can integrate with DALL-E, Stable Diffusion, or other APIs
    setError('Image generation not implemented yet. Please upload an image.')
  }

  const handleCheckout = async () => {
    if (!imageData || !shop || !productId || !productDetails) {
      setError('Missing required data')
      return
    }

    if (!productDetails.shopVariantId) {
      setError('Product variant not configured')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, save the design
      const saveResponse = await fetch('/api/save-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: productDetails.shopId,
          productId: productDetails.id,
          imageData,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save design')
      }

      const { design } = await saveResponse.json()

      // Then, create checkout
      const checkoutResponse = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: productDetails.shopId,
          productId: productDetails.id,
          designId: design.id,
          variantId: productDetails.shopVariantId,
          quantity: 1,
        }),
      })

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json()
        throw new Error(errorData.error || 'Failed to create checkout')
      }

      const { checkoutUrl } = await checkoutResponse.json()

      // Redirect to Shopify checkout
      window.location.href = checkoutUrl
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading product...</div>
      </div>
    )
  }

  if (!productDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Product not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Customize Your Product</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Your Design</h2>
            
            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
                >
                  Upload Image
                </button>
              </div>

              <div>
                <button
                  onClick={handleGenerateImage}
                  className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
                >
                  Generate Image (AI)
                </button>
              </div>
            </div>
          </div>

          {previewUrl && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-96 object-contain"
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={handleCheckout}
              disabled={!imageData || loading}
              className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Add to Cart & Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <CustomizeContent />
    </Suspense>
  )
}

