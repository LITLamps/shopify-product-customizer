import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shopify Product Customizer',
  description: 'Customize products and checkout through Shopify',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

