import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class", // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5", // indigo-600 (ili emerald)
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
    },
  },
  plugins: [],
};

export default config;
