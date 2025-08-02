/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simple configuration for testing builds
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable problematic features during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer, dev }) => {
    // Ignore backend files during webpack compilation
    config.module.rules.push({
      test: /backend\/.*\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Add optimization for build performance
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
}

module.exports = nextConfig
