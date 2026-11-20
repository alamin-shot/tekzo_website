import { IoFlameOutline } from "react-icons/io5";
import SidebarLink from "./SidebarLink";
import { QUICK_LINKS } from "./quickLinks";

const CATEGORY_LINK_CLASS = "group lg:flex items-center justify-between cursor-pointer hidden";

// /home-categories may arrive as a bare array or wrapped in { data: [...] };
// anything else renders no categories instead of crashing on .map().
const toCategoryList = (homeCat) =>
  Array.isArray(homeCat) ? homeCat : Array.isArray(homeCat?.data) ? homeCat.data : [];

// Sidebar content before the user types: quick links + home categories.
export default function TrendingLinks({ loading, homeCat, onSelect }) {
  const categories = toCategoryList(homeCat);

  return (
    <>
      <div className="flex items-center gap-2 text-primary mb-4 lg:mb-8  ">
        <IoFlameOutline className="text-xl" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Trending Now</span>
      </div>

      <nav className="space-y-6 ">
        <div>
          {loading ? (
            <p className="text-sm text-gray-600">Loading...</p>
          ) : (
            <ul className="space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.href} className="">
                  <SidebarLink href={item.href} label={item.name} tag="NEW" onClick={onSelect} />
                </li>
              ))}
              {categories.map((item) => (
                <li key={item.id ?? item.slug} className="">
                  <SidebarLink href={`/categories/${item?.slug}`} label={item.name} tag="HOT" onClick={onSelect} className={CATEGORY_LINK_CLASS} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </>
  );
}
