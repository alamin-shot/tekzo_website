import { notFound } from "next/navigation";

// Careers is temporarily hidden: every /careers route (listing, apply/[slug],
// application-form) returns 404. Set CAREERS_ENABLED to true to restore it.
const CAREERS_ENABLED = false;

export default function CareersLayout({ children }) {
  if (!CAREERS_ENABLED) notFound();
  return children;
}
