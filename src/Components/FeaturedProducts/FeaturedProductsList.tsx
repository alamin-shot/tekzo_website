import CardMain from "@/Components/ReuseableComponent/CardMain";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import type { FeaturedProductsListProps } from "@/types/props/home";
import { fieldsOf, isList, lengthOf, lowerOpt, mapList, rec, requireString } from "@/lib/json";
import { keyFrom } from "@/lib/render";

// `(x || "").toLowerCase()` — a truthy non-string threw before; kept.
const lower = (value: unknown): string => requireString(value || "").toLowerCase();

const FeaturedProductsList = ({ products = [], searchQuery = "" }: FeaturedProductsListProps) => {
  const productList = isList(products)
    ? products
    : rec(products)?.data || rec(products)?.products || [];

  // `productList.length` (strings and arrays have one)
  if (!lengthOf(productList)) {
    return <NoProductFound />;
  }

  // Filter products by search query if provided
  let filteredProducts: unknown = productList;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    // `.filter` on a non-array threw before; kept.
    if (!isList(productList)) throw new TypeError("productList.filter is not a function");
    filteredProducts = productList.filter((entry) => {
      const product = rec(entry);
      const nameMatch = lower(product?.product_name || product?.name)
        .includes(query);
      const categoryMatch = lower(rec(product?.category)?.name || product?.category)
        .includes(query);
      const brandMatch = lower(rec(product?.brand)?.name || product?.brand)
        .includes(query);
      return nameMatch || categoryMatch || brandMatch;
    });
  }

  if (lengthOf(filteredProducts) === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-2">
          No featured products found for &quot;{searchQuery}&quot;
        </p>
        <p className="text-gray-400 text-sm">
          Try searching with different keywords
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-gap my-my">
      {mapList(filteredProducts, (entry) => {
        // `product.id` threw for a null entry; fieldsOf keeps that.
        const item = fieldsOf(entry);
        const product = rec(entry);
        return (
        <CardMain
          key={keyFrom(item.id || item._id || item.slug)}
          product={entry}
          name={product?.product_name || product?.name}
          category={rec(product?.category)?.name || product?.category}
          categoryLink={lowerOpt(rec(product?.category)?.slug)}
          badge={product?.badge}
          currentPrice={product?.final_price}
          originalPrice={product?.regular_price}
          discountPercentage={product?.discount_label}
          discountAmount={product?.discount_amount}
          rating={product?.rating}
          image={product?.product_image}
          link={product?.slug}
          isStock={product?.is_stock}
          from={"featured-products"}
        />
        );
      })}
    </div>
  );
};

export default FeaturedProductsList;
