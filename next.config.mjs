/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed static export to enable API routes and dynamic proxy
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
