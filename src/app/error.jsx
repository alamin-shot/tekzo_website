"use client"; // Error boundaries must be Client Components

import ErrorFallback from "@/Components/ErrorFallback/ErrorFallback";

// Catches errors in every route below the root layout, including the
// (main) and dashboard layouts themselves (navbar/footer/settings failures).
// Errors in app/layout.jsx itself need app/global-error.jsx.
export default function Error(props) {
  return <ErrorFallback {...props} />;
}
