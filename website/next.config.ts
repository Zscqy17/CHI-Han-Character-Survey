import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  // The current Vinext exporter cannot prerender dynamic routes with basePath.
  // Keep its routes at root; catalogue links include the deployment prefix.
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
