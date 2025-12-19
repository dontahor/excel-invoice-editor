import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/excel-invoice-editor',
  assetPrefix: '/excel-invoice-editor/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
