import Link from 'next/link'

export default function Home() {
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

          <div className="space-x-4">
            <Link
              href="/auth"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Install App
            </Link>
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

