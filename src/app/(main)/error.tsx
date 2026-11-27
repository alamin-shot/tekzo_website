"use client"; // Error boundaries must be Client Components

import type { ErrorBoundaryProps } from "@/types/props/layout";
import ErrorFallback from "@/Components/ErrorFallback/ErrorFallback";

// Catches errors in storefront pages while keeping the (main) layout
// (navbar, footer) rendered around the fallback.
export default function MainError(props: ErrorBoundaryProps) {
  return <ErrorFallback {...props} />;
}
