"use client"; // Error boundaries must be Client Components

import ErrorFallback from "@/Components/ErrorFallback/ErrorFallback";

// Catches errors in storefront pages while keeping the (main) layout
// (navbar, footer) rendered around the fallback.
export default function MainError(props) {
  return <ErrorFallback {...props} />;
}
