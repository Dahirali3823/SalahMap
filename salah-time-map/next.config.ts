import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production deployment
  reactStrictMode: true,
  
  // Disable image optimization to speed up build
  images: {
    unoptimized: true,
  },
  serverComponentsExternalPackages: [],
  
  // Add the following to optimize for API routes
  experimental: {},
  
  // Optimize webpack for faster builds
  webpack: (config) => {
    // Reduce the build size
    config.optimization.minimize = true;
    return config;
  },
};

export default nextConfig;