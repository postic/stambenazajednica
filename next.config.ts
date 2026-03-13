import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // dozvoljavamo samo hostname koji je definisan u env
    domains: [process.env.NEXT_PUBLIC_IMAGE_HOST || 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST || 'localhost',
      },
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST || 'localhost',
      },
    ],
  },
};

export default nextConfig;
