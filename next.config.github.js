/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages production build configuration
  output: 'export',
  trailingSlash: true,
  basePath: '/DATACRM',
  assetPrefix: '/DATACRM/',
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
  // Disable problematic features for static export
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
