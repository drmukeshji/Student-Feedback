import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6fe",
          500: "#2f5bd3",
          600: "#2348b5",
          700: "#1d3a91",
          800: "#1b3274",
          900: "#152555",
        },
      },
    },
  },
  plugins: [],
};
export default config;
