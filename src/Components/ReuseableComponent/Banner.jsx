import Image from "next/image";
import SearchBar from "./SearchBar";

// Non-home pages only. Deliberately has zero reference to swiper anywhere
// in its module graph — an earlier version routed the homepage hero
// through a `dynamic(() => import("./HomeHeroBanner"))` inside this same
// component, but Next still preloaded that chunk on every page rendering
// <Banner> (contact-us, outlets, etc.) because the client-reference
// manifest is built per-module, not per runtime branch — the `from`
// prop check doesn't stop the chunk from being requested. Splitting the
// homepage hero into its own top-level component (HomeBanner, rendered
// only by HomePage.jsx) is what actually keeps swiper off these routes.
// hideImageOnMobile: hides only the banner image below lg (phones + tablets);
// the SearchBar above it stays visible.
const Banner = ({ image, title, hideImageOnMobile = false }) => {
  return (
    <div className="relative">
      <SearchBar />

      <div className={`${hideImageOnMobile ? "hidden lg:block " : ""}relative`}>
        <div className="h-30 md:h-40 xl:h-65 rounded-2xl lg:rounded-[40px] overflow-hidden">
          <Image
            src={image || "/placeholder.jpg"}
            alt={title}
            className="w-full h-full object-cover rounded-2xl lg:rounded-[40px] "
            height={300}
            width={1600}
            sizes="100vw"
            priority
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;
