import Link from "next/link";

const DEFAULT_LINK_CLASS = "group flex items-center justify-between cursor-pointer";

// One row in the search sidebar: label on the left, small tag pill
// ("NEW" / "HOT") on the right.
export default function SidebarLink({ href, label, tag, onClick, className = DEFAULT_LINK_CLASS }) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      <span className="text-xs text-gray-500 group-hover:text-black transition-colors">{label}</span>
      <span className="text-[9px] bg-gray-200 text-gray-400 px-1.5 py-0.5 rounded group-hover:bg-orange-100 group-hover:text-primary/80 transition-all font-bold">{tag}</span>
    </Link>
  );
}
