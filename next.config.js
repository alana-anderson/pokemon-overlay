/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['images.pokemontcg.io'],
  },
}

module.exports = nextConfig
