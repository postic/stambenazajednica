const withPWA = require("next-pwa")({
  dest: "public",

  register: false,

  swSrc: "src/sw.js",

  skipWaiting: true,

  disable: process.env.NODE_ENV === "development",

  clientsClaim: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
