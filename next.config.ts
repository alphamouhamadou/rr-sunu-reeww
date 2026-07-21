import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      { source: '/connexion', destination: '/' },
      { source: '/membre', destination: '/' },
      { source: '/admin', destination: '/' },
      { source: '/actualites', destination: '/' },
      { source: '/vision', destination: '/' },
      { source: '/rejoindre', destination: '/' },
      { source: '/don', destination: '/' },
      { source: '/evenements', destination: '/' },
      { source: '/mot-de-passe-oublie', destination: '/' },
    ]
  },
}

export default nextConfig