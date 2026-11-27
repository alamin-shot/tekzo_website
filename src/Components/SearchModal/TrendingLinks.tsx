import { IoFlameOutline } from "react-icons/io5";
import SidebarLink from "./SidebarLink";
import { QUICK_LINKS } from "./quickLinksData";
import type { TrendingLinksProps } from "@/types/search";
import { fieldsOf, isList, rec } from "@/lib/json";
import { keyFrom, nodeOf } from "@/lib/render";

const CATEGORY_LINK_CLASS = "group lg:flex items-center justify-between cursor-pointer hidden";

// /home-categories may arrive as a bare array or wrapped in { data: [...] };
// anything else renders no categories instead of crashing on .map().
const toCategoryList = (homeCat: unknown): unknown[] => {
  const data = rec(homeCat)?.data;
  return isList(homeCat) ? homeCat : isList(data) ? data : [];
};

// Sidebar content before the user types: quick links + home categories.
export default function TrendingLinks({ loading, homeCat, onSelect }: TrendingLinksProps) {
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
              {categories.map((entry) => {
                // `item.id` threw for a null entry; fieldsOf keeps that.
                const item = fieldsOf(entry);
                return (
                <li key={keyFrom(item.id ?? item.slug)} className="">
                  <SidebarLink href={`/categories/${item?.slug}`} label={nodeOf(item.name)} tag="HOT" onClick={onSelect} className={CATEGORY_LINK_CLASS} />
                </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>
    </>
  );
}
