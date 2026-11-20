/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./Components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-switzer)", "var(--font-bornomala)", "sans-serif"],
        switzer: ["var(--font-switzer)", "var(--font-bornomala)", "sans-serif"],
        bornomala: ["var(--font-bornomala)", "var(--font-switzer)", "sans-serif"],
        bengali: ["var(--font-bornomala)", "var(--font-switzer)", "sans-serif"],
        bangla: ["var(--font-bornomala)", "var(--font-switzer)", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
