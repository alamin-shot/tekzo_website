"use client";

import Link from "next/link";
import type { PreFetchLinkProps } from "@/types/props/layout";

// Thin wrapper kept so the ~30 call sites across the app don't need to
// change. The stale-router-cache recovery this used to implement per
// instance (its own useRouter/usePathname/useEffect trio, multiplied by
// however many of these render on a page) now lives once, globally, in
// RouterStaleRecovery — see that file. data-nav-recovery is how it finds
// these links via event delegation.
export default function PreFetchLink({ href, children, className, onClick, prefetch, ...props }: PreFetchLinkProps) {
  return (
    <Link href={href} className={className} onClick={onClick} prefetch={prefetch} data-nav-recovery {...props}>
      {children}
    </Link>
  );
}
