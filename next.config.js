/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Only export for production
  ...(process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true' && {
    output: 'export',
    trailingSlash: true,
    basePath: '/DATACRM',
    assetPrefix: '/DATACRM/',
  }),
};

module.exports = nextConfig;
