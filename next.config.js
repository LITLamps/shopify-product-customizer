/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '*.supabase.co', '*.s3.amazonaws.com'],
  },
}

module.exports = nextConfig

