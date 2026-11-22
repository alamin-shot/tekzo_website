import { getFlashSaleData } from "@/lib/api";
import { SITE_URL, absoluteUrl, serializeJsonLd } from "@/lib/seo/jsonLd";

// Same limit the homepage Flash Sale slider uses, so the schema only lists
// products that are actually visible on the page (a schema.org/Google rule).
const HOME_FLASH_SALE_LIMIT = 12;

// Content schema for the homepage: a CollectionPage whose main entity is an
// ItemList of the flash-sale products rendered on it, each as a Product with
// its real price and stock. Links to the site-wide WebSite/Organization nodes
// from CompanyJsonLd by @id.
const HomeJsonLd = async () => {
  const { products } = await getFlashSaleData({ limit: HOME_FLASH_SALE_LIMIT });

  const listed = (products || []).filter((p) => p?.slug && p?.product_name).slice(0, HOME_FLASH_SALE_LIMIT);
  if (!listed.length) return null;

  // Product nodes sit at the top level of @graph (linked by @id) rather than
  // nested inside the ItemList — same meaning to schema.org, but tools that
  // only read top-level @type values can now see the Product content type.
  const productNodes = listed.map((p) => {
    const url = `${SITE_URL}/product/${p.slug}`;
    const price = Math.trunc(Number(p.final_price) || 0);
    return {
      "@type": "Product",
      "@id": `${url}#product`,
      name: p.product_name,
      url,
      ...(absoluteUrl(p.product_image) && { image: absoluteUrl(p.product_image) }),
      ...(p.category?.name && { category: p.category.name }),
      ...(p.brand?.name && { brand: { "@type": "Brand", name: p.brand.name } }),
      ...(price > 0 && {
        offers: {
          "@type": "Offer",
          url,
          price,
          priceCurrency: "BDT",
          availability: p.is_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: { "@id": `${SITE_URL}/#organization` },
        },
      }),
    };
  });

  const listId = `${SITE_URL}/#flash-sale-list`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: "TEKZO – Trusted Smartphone, Gadget & Electronics Store in Bangladesh",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": listId },
      },
      {
        "@type": "ItemList",
        "@id": listId,
        name: "Flash Sale",
        numberOfItems: productNodes.length,
        itemListElement: productNodes.map((node, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: node.url,
          item: { "@id": node["@id"] },
        })),
      },
      ...productNodes,
    ],
  };

  return <script id="home-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />;
};

export default HomeJsonLd;
