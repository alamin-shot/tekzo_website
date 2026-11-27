"use client";

import { usePathname } from "next/navigation";
import type { LayoutProps } from "@/types/props/layout";

export default function NavbarVisibilityWrapper({ children }: LayoutProps) {
  const pathname = usePathname();
  if (pathname?.startsWith("/product/")) {
    return null;
  }
  return children;
}
