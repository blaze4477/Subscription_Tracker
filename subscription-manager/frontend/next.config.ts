import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/subscription-tracker',
  trailingSlash: true,
  assetPrefix: '/subscription-tracker',
  output: 'standalone'
};

export default nextConfig;
