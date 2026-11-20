import { IoChevronDown } from "react-icons/io5";
import SidebarLink from "./SidebarLink";
import { QUICK_LINKS } from "./quickLinks";

// Sidebar content while searching: collapsible list on mobile, always
// visible on desktop. Open state is owned by SearchSidebar so it survives
// switching between the trending and searching views (as before).
export default function QuickLinks({ isOpen, setIsOpen, onSelect }) {
  return (
    <>
      <div className="flex items-center gap-2 text-primary mb-4 lg:mb-8">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Quick Links</span>
      </div>

      {/* Mobile Collapsible */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <span className="text-xs text-gray-600">Browse More</span>
          <IoChevronDown className={`text-gray-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 mt-3" : "max-h-0"}`}>
          <ul className="space-y-3 ">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <SidebarLink
                  href={link.href}
                  label={link.name}
                  tag="NEW"
                  onClick={() => {
                    onSelect();
                    setIsOpen(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desktop Always Visible */}
      <nav className="hidden lg:block space-y-6">
        <div>
          <ul className="space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <SidebarLink href={link.href} label={link.name} tag="NEW" onClick={onSelect} />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
