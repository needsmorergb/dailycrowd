import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // Security: Hide source code
  poweredByHeader: false,             // Security: Obscure stack
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'frontend-api.pump.fun',
      }
    ],
  },
};

export default nextConfig;
