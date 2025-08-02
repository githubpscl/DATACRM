/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove export mode for development builds
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Exclude backend files from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude backend directory
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config, { isServer }) => {
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
      };
    }

    return config;
  },
  experimental: {
    // Disable some experimental features that might cause issues
    appDir: true,
  },
}

module.exports = nextConfig
