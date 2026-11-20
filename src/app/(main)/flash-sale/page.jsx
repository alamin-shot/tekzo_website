import Banner from "@/Components/ReuseableComponent/Banner";
import Section from "@/Components/ReuseableComponent/Section";
import FlashSaleCountdown from "@/Components/Home/FlashSale/FlashSaleCountdown";
import { getFlashSaleData, DEFAULT_FLASH_SALE_SEO } from "@/lib/api";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import { MdVerified } from "react-icons/md";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import Image from "next/image";
import PageDescription from "@/Components/Description/PageDescription";
import Filter from "@/Components/Shop/Filter";
import { filterAndSortProducts } from "@/utils/filterProducts";

export const revalidate = 3600;

export async function generateMetadata() {
  const data = await getFlashSaleData();
  const seo = data?.seoData || DEFAULT_FLASH_SALE_SEO;

  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const title = seo?.title || "Flash Sale Gadgets in Bangladesh";
  const description =
    seo?.description ||
    "Shop the latest Flash Sale deals at TEKZO Bangladesh. Save big on smartphones, chargers, power banks, cables, and audio devices. Limited-time offers available online.";
  const canonical = seo?.canonical || `${baseUrl}/flash-sale`;
  const siteName = seo?.siteName || "TEKZO";
  const keywords = seo?.tags
    ? seo.tags.split(",").map((t) => t.trim())
    : [
        "Flash Sale Bangladesh",
        "Gadget Flash Sale",
        "Smartphone Deals Bangladesh",
        "Tech Accessories Sale",
        "Power Bank Sale",
        "USB Cable Offer",
        "Fast Charger Sale",
        "Mobile Accessories Discount",
        "TEKZO Flash Sale",
        "Electronics Offer Bangladesh",
        "Online Gadget Store Bangladesh",
      ];

  let ogImage = seo?.banner || seo?.info_banner || seo?.logo || "/sidebar-icons/offers.png";
  if (ogImage && ogImage.startsWith("/")) {
    ogImage = `${baseUrl}${ogImage}`;
  }

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "content-signal": "search=yes,ai-train=no",
    },
  };
}

export default async function FlashSalePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentFilters = {
    min_price: resolvedSearchParams?.min_price || "",
    max_price: resolvedSearchParams?.max_price || "",
    sort_by: resolvedSearchParams?.sort_by || "",
    brand: resolvedSearchParams?.brand || "",
    category: resolvedSearchParams?.category || "",
    stock: resolvedSearchParams?.stock || "",
  };

  const { products, endAt, description, seoData } = await getFlashSaleData(currentFilters);
  const displayProducts = filterAndSortProducts(products, currentFilters);

  const seo = seoData || DEFAULT_FLASH_SALE_SEO;
  const pageDescription = description || seo?.page_description || "";

  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonicalUrl = seo?.canonical || `${baseUrl}/flash-sale`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo?.title || "Flash Sale Gadgets in Bangladesh",
    description: seo?.description,
    url: canonicalUrl,
    ...(seo?.banner ? { image: seo.banner } : {}),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Banner
        image={seo?.banner || seo?.info_banner || "/flashsale/flashsale-cover.jpg"}
        title={seo?.title || "Flash Sale"}
      />

      <main>
        <Breadcrumbs />

        <Section>
          <div>
            {/* Header with Logo, Title, Verification Tick Mark & Countdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              {/* Left: Logo + Title */}
              <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                {/* Logo Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
                  <Image
                    src={seo?.logo || "/sidebar-icons/offers.png"}
                    alt={seo?.title || "Flash Sale"}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                </div>

                {/* Title & Verification Tick Mark */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {seo?.title || (seo?.siteName ? `${seo.siteName} Flash Sale` : "TEKZO Flash Sale")}
                    </h1>
                    <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {seo?.description || "Limited time deals \u2014 shop now before they're gone!"}
                  </p>
                </div>
              </div>

              {/* Right / Next Line on Mobile: Countdown */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-end gap-3 sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Offer Ending In:</p>
                <FlashSaleCountdown endAt={endAt} />
              </div>
            </div>

            {/* Filter Section */}
            <Filter currentFilters={currentFilters} />

            {/* Item count */}
            <p className="text-xs lg:text-sm text-gray-500 my-3">
              Showing <span className="font-semibold text-gray-900">{displayProducts.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{products.length}</span> deals
            </p>

            {/* Product Grid */}
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
                {displayProducts.map((product) => (
                  <CardMain
                    key={product.id}
                    product={product}
                    name={product?.product_name}
                    category={product?.category?.name}
                    categoryLink={product?.category?.slug?.toLowerCase()}
                    badge={product?.badge}
                    currentPrice={product?.final_price}
                    originalPrice={product?.regular_price}
                    discountPercentage={product?.discount_label}
                    discountAmount={product?.discount_amount}
                    rating={product?.rating}
                    image={product?.product_image}
                    link={product?.slug}
                    isStock={product?.is_stock}
                    productData={product}
                    from={"flash-sale"}
                  />
                ))}
              </div>
            ) : (
              <NoProductFound />
            )}
          </div>
        </Section>
        <PageDescription
          title={`Learn More About ${seo?.siteName || "TEKZO"} Flash Sale`}
          description={pageDescription}
        />
      </main>
    </div>
  );
}
