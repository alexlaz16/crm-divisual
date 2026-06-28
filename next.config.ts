import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.netlify.app', '*.netlify.live'],
    },
  },
}

export default nextConfig
