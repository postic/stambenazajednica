import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    domains: ['zitnitrg.stambenazajednica.in.rs'],
  },
};

export default nextConfig;

/*import type { NextConfig } from "next";
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
*/
