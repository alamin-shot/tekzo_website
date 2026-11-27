"use client"; // Error boundaries must be Client Components

import type { ErrorBoundaryProps } from "@/types/props/layout";
import ErrorFallback from "@/Components/ErrorFallback/ErrorFallback";

// Catches errors in every route below the root layout, including the
// (main) and dashboard layouts themselves (navbar/footer/settings failures).
// Errors in app/layout.tsx itself need app/global-error.tsx.
export default function Error(props: ErrorBoundaryProps) {
  return <ErrorFallback {...props} />;
}
