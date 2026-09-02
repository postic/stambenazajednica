const withPWA = require("next-pwa")({
  dest: "public",

  // =======================================================
  // SERVICE WORKER REGISTRATION
  // =======================================================

  register: false,

  // =======================================================
  // SERVICE WORKER
  // =======================================================

  swSrc: "src/sw.js",

  // =======================================================
  // UPDATE
  // =======================================================

  skipWaiting: true,

  // =======================================================
  // DEVELOPMENT
  // =======================================================

  // U developmentu next-pwa ne generiše SW.
  // /sw.js se registruje ručno iz AllowNotifications.tsx.
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
