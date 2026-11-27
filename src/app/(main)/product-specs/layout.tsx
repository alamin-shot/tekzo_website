// Placeholder page that renders the product template without a product —
// keep it out of search results.
import type { Metadata } from "next";
import type { LayoutChildrenProps } from "@/types/props/checkout";

export const metadata: Metadata = {
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function ProductSpecsLayout({ children }: LayoutChildrenProps) {
  return children;
}
