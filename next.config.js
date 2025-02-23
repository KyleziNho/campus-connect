/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com'
      },
      {
        protocol: 'https', 
        hostname: 'media-photos.depop.com'
      },
      {
        protocol: 'https',
        hostname: 'images1.vinted.net'
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      }
    ]
  },
  trailingSlash: false
}

module.exports = nextConfig