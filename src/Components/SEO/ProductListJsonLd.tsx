import type { JsonRecord } from "@/types/json";
import type { ProductListJsonLdProps } from "@/types/props/layout";
import { SITE_URL, absoluteUrl, serializeJsonLd } from "@/lib/seo/jsonLd";
import { isList, rec } from "@/lib/json";

const MAX_ITEMS = 24;

// Listing APIs don't agree on field names; read the common variants.
const pick = (p: unknown, ...keys: string[]): unknown => keys.map((k) => rec(p)?.[k]).find((v) => v !== undefined && v !== null && v !== "");

function toProductNode(p: unknown, productPath: string): JsonRecord | null {
  const slug = pick(p, "slug", "product_slug");
  const name = pick(p, "product_name", "name", "title");
  if (!slug || !name) return null;

  const url = `${SITE_URL}${productPath}/${slug}`;
  const price = Math.trunc(Number(pick(p, "final_price", "price", "current_price", "sale_price")) || 0);
  const image = absoluteUrl(pick(p, "product_image", "image", "thumbnail"));
  const stock = pick(p, "is_stock", "in_stock", "stock");
  const category = rec(rec(p)?.category)?.name;
  const brand = rec(rec(p)?.brand)?.name;

  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    url,
    ...(image ? { image } : {}),
    ...(category ? { category } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(price > 0
      ? {
          offers: {
            "@type": "Offer",
            url,
            price,
            priceCurrency: "BDT",
            ...(stock !== undefined
              ? {
                  availability: stock && stock !== "0" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                }
              : {}),
            seller: { "@id": `${SITE_URL}/#organization` },
          },
        }
      : {}),
  };
}

const isNode = (n: JsonRecord | null): n is JsonRecord => Boolean(n);

/**
 * Content schema for a product listing page: CollectionPage -> ItemList ->
 * Product nodes, all top-level in one @graph (linked by @id) so tools that
 * only read top-level @type values see the Product content type.
 *
 * Only pass products that are actually rendered on the page.
 *
 * @param products     array of listing items (API shape)
 * @param path         this page's path, e.g. "/shop" or "/categories/iphone"
 * @param name         page name (CollectionPage.name)
 * @param listName     ItemList name, defaults to `name`
 * @param description  optional page description
 * @param productPath  URL prefix for items, "/product" (default) or "/used-device/product"
 */
export default function ProductListJsonLd({ products, path, name, listName, description, productPath = "/product" }: ProductListJsonLdProps) {
  const nodes = (isList(products) ? products : [])
    .map((p) => toProductNode(p, productPath))
    .filter(isNode)
    // the same product can appear twice (variants) — keep one node per @id
    .filter((n, i, arr) => arr.findIndex((m) => m["@id"] === n["@id"]) === i)
    .slice(0, MAX_ITEMS);

  if (!nodes.length) return null;

  const pageUrl = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const pageId = `${pageUrl.replace(/\/$/, "")}/#webpage`;
  const listId = `${pageUrl.replace(/\/$/, "")}/#itemlist`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": pageId,
        url: pageUrl,
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": listId },
      },
      {
        "@type": "ItemList",
        "@id": listId,
        ...(listName || name ? { name: listName || name } : {}),
        numberOfItems: nodes.length,
        itemListElement: nodes.map((node, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: node.url,
          item: { "@id": node["@id"] },
        })),
      },
      ...nodes,
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />;
}
