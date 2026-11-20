"use client";

import { usePathname } from "next/navigation";

export default function NavbarVisibilityWrapper({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/product/")) {
    return null;
  }
  return children;
}
