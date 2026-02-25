import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: [
      "https://nextjs.ddev.site:3001",
      "https://next.ddev.site",
      "http://next.ddev.site",
      "https://*.ddev.site",
      "http://*.ddev.site",
    ],
  },

  images: {
    domains: ["drupal.ddev.site"],
  },
};

export default nextConfig;
