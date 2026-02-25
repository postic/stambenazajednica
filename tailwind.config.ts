import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class", // enable class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
