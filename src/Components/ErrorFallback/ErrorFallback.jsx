"use client";

import { useEffect } from "react";

// Shared UI for the route error boundaries (src/app/error.jsx,
// src/app/(main)/error.jsx). Deliberately self-contained: no API calls,
// no next/image, no context, so it can never fail for the same reason
// (e.g. the backend being down) as the page it replaces.
export default function ErrorFallback({ error, retry, reset }) {
  useEffect(() => {
    // Server Component errors arrive with a generic message plus a digest
    // that matches the server log entry; client errors may not be Errors.
    console.error(error);
  }, [error]);

  // Next 16.4: retry() re-fetches and re-renders the segment (recovers from
  // a failed server fetch); reset() only re-renders. Prefer retry.
  const tryAgain = () => (retry ?? reset)?.();
  const digest = error instanceof Error ? error.digest : undefined;

  return (
    <div
      role="alert"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
    >
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm md:text-base text-gray-600">
        This part of the page couldn&apos;t load. It may be a temporary
        problem. Please try again in a moment.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={tryAgain}
          className="bg-primary text-white rounded-full px-6 py-2 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try Again
        </button>
        {/* Plain <a>: a full reload is the most reliable recovery after an error. */}
        <a
          href="/"
          className="rounded-full px-6 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
        >
          Go to homepage
        </a>
      </div>
      {digest && <p className="text-xs text-gray-400">Error reference: {digest}</p>}
    </div>
  );
}
