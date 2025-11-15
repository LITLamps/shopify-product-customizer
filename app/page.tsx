'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function HomeContent() {
  const searchParams = useSearchParams()
  const shop = searchParams.get('shop')
  const error = searchParams.get('error')
  
  // If shop parameter exists (from Shopify redirect), redirect to auth
  if (shop) {
    window.location.href = `/auth?shop=${shop}`
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Redirecting...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Shopify Product Customizer
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Let your customers create custom designs and checkout seamlessly through Shopify
          </p>
          
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">🎨 Customization</h3>
                <p className="text-gray-600">Upload or generate custom designs</p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">🛍️ Shopify Integration</h3>
                <p className="text-gray-600">Seamless checkout through Shopify</p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">📦 Design Storage</h3>
                <p className="text-gray-600">Secure cloud storage for all designs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            
            {error === 'missing-shop' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Please enter your shop domain to install the app.
              </div>
            )}
            
            {error === 'invalid-shop' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Invalid shop domain. Please enter a valid shop domain (e.g., your-store.myshopify.com).
              </div>
            )}
            
            <p className="text-gray-600 mb-4">
              To install this app, please visit the app from your Shopify Admin panel or enter your shop domain below:
            </p>
            <div className="max-w-md mx-auto">
              <form 
                action="/auth" 
                method="get"
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="shop"
                  placeholder="your-store.myshopify.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  pattern="[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Install App
                </button>
              </form>
            </div>
          </div>

          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

