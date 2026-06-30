/** @type {import('next').NextConfig} */
const ADMIN_PATH = (process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin').replace(/^\//, '').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  experimental: {
    outputFileTracingIncludes: {
      '/*': [
        './node_modules/.prisma/client/**/*',
        './public/themes/**/*',
      ],
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
    ],
    unoptimized: true,
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
