import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#f5d485',
          400: '#e8b84b',
          500: '#c9922a',
          600: '#a87420',
        },
        pitch: '#1a3a2a',
      },
    },
  },
  plugins: [],
};
export default config;
