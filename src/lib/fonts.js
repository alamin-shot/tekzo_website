import localFont from "next/font/local";

export const switzer = localFont({
  src: [
    {
      path: "../fonts/Switzer/Fonts/WEB/fonts/Switzer-Variable.woff2",
      style: "normal",
    },
    {
      path: "../fonts/Switzer/Fonts/WEB/fonts/Switzer-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
});

// Bornomala is only a fallback after Switzer (see globals.css), so it is
// needed solely for Bengali glyphs (e.g. "৳" in prices, Bengali copy in
// checkout/claims). The .subset.woff2 files are pyftsubset'd from the TTFs
// to the Bengali block below, keeping all GSUB/GPOS shaping features.
// - unicode-range: the browser downloads a face only when the page actually
//   renders one of these code points.
// - preload: false: it no longer competes with CSS/hero image bandwidth.
// - Two weight ranges reproduce the old 7-face mapping exactly
//   (300-500 -> Regular, 600-900 -> Bold).
export const bornomala = localFont({
  src: [
    {
      path: "../fonts/Bornomala/Bornomala-Regular.subset.woff2",
      weight: "300 500",
      style: "normal",
    },
    {
      path: "../fonts/Bornomala/Bornomala-Bold.subset.woff2",
      weight: "600 900",
      style: "normal",
    },
  ],
  variable: "--font-bornomala",
  display: "swap",
  preload: false,
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0964-0965, U+0980-09FF, U+200C-200D, U+25CC",
    },
  ],
});
