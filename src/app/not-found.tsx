import Image from "next/image";
import Link from "next/link";
import ClientNotFoundContent from "./ClientNotFoundContent";

// This is the ROOT-level 404 boundary (outside the (main) route group), so
// Next.js keeps it resolved and inlined into every page's RSC payload as
// the app-wide fallback for instant client-side notFound() navigation.
// It must stay free of async data fetching (Navbar2/FooterPage/getSettings
// previously pulled ~280KB of duplicate site-shell data into every page's
// HTML). Real 404s inside (main) routes are handled by the lighter
// (main)/not-found.jsx instead, which gets the full site chrome for free
// from the shared layout — this one only ever fires for routes outside all
// route groups (e.g. /dashboard/*).
export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center gap-6">
      <title>404 Page Not Found - Tekzo</title>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="TEKZO"
          width={140}
          height={47}
          priority
          fetchPriority="high"
        />
      </Link>
      <ClientNotFoundContent />
      <Link
        href="/"
        className="gradient text-white px-8 py-2 rounded-md text-sm hover:shadow-lg transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
