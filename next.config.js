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
  async redirects() {
    return [
      // Legacy placeholder case pages (fallback data removed) → 301 to cases list
      { source: '/cases/commercial-flooring', destination: '/cases', permanent: true },
      { source: '/cases/europe-furniture', destination: '/cases', permanent: true },
      { source: '/cases/europe-furniture-leather', destination: '/cases', permanent: true },
      { source: '/cases/automotive-interior', destination: '/cases', permanent: true },
      // Legacy placeholder news pages (fallback data removed) → 301 to news list
      { source: '/news/iso-certification', destination: '/news', permanent: true },
      { source: '/news/eco-pvc-launch', destination: '/news', permanent: true },
      { source: '/news/trade-show-2024', destination: '/news', permanent: true },
    ];
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
