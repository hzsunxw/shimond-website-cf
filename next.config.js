const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare')

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev()
}

/** @type {import('next').NextConfig} */
const ADMIN_PATH = (process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin').replace(/^\//, '').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,

  serverExternalPackages: ["@prisma/client", ".prisma/client"],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
    ],
    unoptimized: true,
  },
  async rewrites() {
    if (ADMIN_PATH && ADMIN_PATH !== 'admin') {
      return [
        {
          source: `/${ADMIN_PATH}`,
          destination: '/admin',
        },
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
