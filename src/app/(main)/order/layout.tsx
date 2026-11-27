// Order result pages (successful/failed/canceled) are per-user — keep out of search results, but let crawlers follow links.
// Applies to every page under this folder.
import type { Metadata } from "next";
import type { LayoutChildrenProps } from "@/types/props/checkout";

export const metadata: Metadata = {
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function OrderLayout({ children }: LayoutChildrenProps) {
  return children;
}
