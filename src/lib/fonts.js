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

export const bornomala = localFont({
  src: [
    {
      path: "../fonts/Bornomala/Bornomala-Regular.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Bornomala/Bornomala-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Bornomala/Bornomala-Regular.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Bornomala/Bornomala-Bold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Bornomala/Bornomala-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Bornomala/Bornomala-Bold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/Bornomala/Bornomala-Bold.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-bornomala",
  display: "swap",
});
