const withPWA = require("next-pwa")({
  dest: "public",

  register: false,

  skipWaiting: true,

  // =======================================================
  // CUSTOM SERVICE WORKER
  // =======================================================

  swSrc: "src/sw.js",

  // =======================================================
  // DEVELOPMENT
  // =======================================================

  // next-pwa ne obrađuje Service Worker u developmentu.
  // Naš /sw.js registrujemo ručno iz AllowNotifications.tsx.
  disable:
    process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
