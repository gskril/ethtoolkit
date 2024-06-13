/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/tools/:path*', // The :path parameter isn't used here so will be automatically passed in the query
      },
    ]
  },
}

module.exports = nextConfig
