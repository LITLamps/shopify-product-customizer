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
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiStyle, setAiStyle] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [showAiPrompt, setShowAiPrompt] = useState(false)
  const [themeMode, setThemeMode] = useState(false)
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
    if (!shop) {
      setError('Shop parameter missing')
      return
    }

    if (!aiPrompt.trim()) {
      setShowAiPrompt(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop,
          prompt: aiPrompt,
          style: aiStyle,
          negativePrompt: negativePrompt,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const { imageUrl } = await response.json()
      setImageData(imageUrl)
      setPreviewUrl(imageUrl)
      setShowAiPrompt(false)
      setAiPrompt('')
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please upload an image instead.')
    } finally {
      setLoading(false)
    }
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Customize Your Design</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={themeMode}
                  onChange={(e) => setThemeMode(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">Theme Mode</span>
              </label>
            </div>
            
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
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Upload Image
                </button>
              </div>

              <div>
                <button
                  onClick={() => setShowAiPrompt(!showAiPrompt)}
                  className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
                >
                  Generate Image (AI)
                </button>
              </div>

              {showAiPrompt && (
                <div className="border-2 border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Describe the image you want to generate:
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A beautiful sunset over mountains with vibrant colors, artistic style"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4 text-base"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Style (optional):
                      </label>
                      <select
                        value={aiStyle}
                        onChange={(e) => setAiStyle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Default</option>
                        <option value="realistic">Realistic</option>
                        <option value="artistic">Artistic</option>
                        <option value="abstract">Abstract</option>
                        <option value="vibrant">Vibrant</option>
                        <option value="minimalist">Minimalist</option>
                        <option value="3d render">3D Render</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Avoid (optional):
                      </label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g., blurry, low quality"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerateImage}
                      disabled={loading || !aiPrompt.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        'Generate Image'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAiPrompt(false)
                        setAiPrompt('')
                        setAiStyle('')
                        setNegativePrompt('')
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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

