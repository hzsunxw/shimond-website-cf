/** @type {import('next').NextConfig} */
const ADMIN_PATH = (process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin').replace(/^\//, '').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  async rewrites() {
    // If admin path is customized, rewrite external path to internal /admin
    if (ADMIN_PATH && ADMIN_PATH !== 'admin') {
      return [
        {
          source: `/${ADMIN_PATH}/:path*`,
          destination: '/admin/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
