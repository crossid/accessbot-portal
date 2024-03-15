/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: '/portal',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com'
      }
    ]
  }
}

export default nextConfig
