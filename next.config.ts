import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb' // or '4mb', '10mb' depending on your needs
    }
  }
};

export default nextConfig;

