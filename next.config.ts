import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      process.env.NEXT_PUBLIC_IMAGE_HOST || "localhost"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST || "localhost",
      },
      {
        protocol: "http",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST || "localhost",
      },
    ],
  },

  // 👇 BITNO: za PWA + next-pwa stabilnost
  webpack: (config) => config,

  turbopack: {} // samo da utiša Next 16 warning
};

export default withPWA(nextConfig);
