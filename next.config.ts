import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for production builds
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true
  },
  // Only add trailing slash for production
  trailingSlash: process.env.NODE_ENV === 'production'
};

export default nextConfig;
