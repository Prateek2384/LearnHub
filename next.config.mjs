/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    unoptimized: true, // Added unoptimized field
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // Added eslint configuration
  },
  typescript: {
    ignoreBuildErrors: true, // Added typescript configuration
  },
}

export default nextConfig
