import { notFound } from "next/navigation";
import type { LayoutChildrenProps } from "@/types/props/checkout";

// Careers is temporarily hidden: every /careers route (listing, apply/[slug],
// application-form) returns 404. Set CAREERS_ENABLED to true to restore it.
const CAREERS_ENABLED = false;

export default function CareersLayout({ children }: LayoutChildrenProps) {
  if (!CAREERS_ENABLED) notFound();
  return children;
}
