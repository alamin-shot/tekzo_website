import SectionHeading from "@/Components/ReuseableComponent/SectionHeading";
import Image from "next/image";
import CardMain from "../ReuseableComponent/CardMain";
import { getCategoryProducts } from "@/lib/api";
import type { CategoryListProps } from "@/types/props/category";
import { fieldsOf, filterList, isList, lengthOf, lowerOpt, mapList, rec, requireString, sliceOf } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

async function getCatProducts() {
  const result = await getCategoryProducts();
  const data = rec(result)?.data;
  if (data) {
    return {
      categories: rec(data)?.categories || [],
      seoData: rec(data)?.seoData || {},
    };
  }
  if (isList(result)) return { categories: result, seoData: {} };
  return { categories: [], seoData: {} };
}

// `value?.some(fn)`: null/undefined → undefined; a non-array threw (no .some); kept.
const someOpt = (value: unknown, fn: (item: unknown) => unknown): boolean | undefined => {
  if (value === null || value === undefined) return undefined;
  if (!isList(value)) throw new TypeError("value.some is not a function");
  return value.some(fn);
};

// `x?.toLowerCase().includes(query)` (undefined when x is nullish; throws for a non-string)
const includesOpt = (value: unknown, query: string): boolean | undefined => lowerOpt(value)?.includes(query);

// `product.name?.… || product.brand?.name?.…` — throws for a null product, as before.
const productMatches = (product: unknown, query: string): boolean | undefined => {
  const { name, brand } = fieldsOf(product);
  return includesOpt(name, query) || includesOpt(rec(brand)?.name, query);
};

const CategoryList = async ({ categoryFilter = "", searchQuery = "" }: CategoryListProps) => {
  const { categories, seoData } = await getCatProducts();

  if (!lengthOf(categories)) {
    return (
      <p className="text-center text-gray-500 py-10">No categories found</p>
    );
  }

  // Filter categories based on categoryFilter
  let filteredCategories: unknown = categoryFilter
    ? filterList(categories, (cat) => fieldsOf(cat).slug === categoryFilter)
    : categories;

  // Filter by search query if provided
  // (`searchQuery.trim()` threw for a non-string search param; kept)
  if (requireString(searchQuery).trim()) {
    const query = requireString(searchQuery).toLowerCase();
    filteredCategories = filterList(filteredCategories, (category) => {
      const { name, products } = fieldsOf(category);
      // Search in category name
      const categoryMatch = includesOpt(name, query);

      // Search in product names within the category
      const productsMatch = someOpt(products, (product) => productMatches(product, query));

      return categoryMatch || productsMatch;
    });

    // If searching within products, also filter products within categories
    filteredCategories = filterList(
      mapList(filteredCategories, (category) => {
        const fields = fieldsOf(category);
        return {
          ...fields,
          products: filterList(
            fields.products,
            (product) =>
              productMatches(product, query) ||
              includesOpt(fields.name, query),
          ),
        };
      }),
      (category) => Number(lengthOf(fieldsOf(category).products)) > 0,
    );
  }

  if (lengthOf(filteredCategories) === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-lg mb-2">
          {searchQuery
            ? `No results found for "${String(searchQuery)}"`
            : "No products found for this category"}
        </p>
        {nodeOf(searchQuery && (
          <p className="text-gray-400 text-sm">
            Try searching with different keywords
          </p>
        ))}
      </div>
    );
  }

  const midPoint = Math.ceil(Number(lengthOf(filteredCategories)) / 2);
  const firstHalf = sliceOf(filteredCategories, 0, midPoint);
  const secondHalf = sliceOf(filteredCategories, midPoint);
  const seo = rec(seoData);

  return (
    <>
      {/* First Half Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {mapList(firstHalf, (item, index) => (
          <div key={idKey(item)} className="flex flex-col h-full">
            <SectionHeading
              title={rec(item)?.name}
              link={`/categories/${lowerOpt(rec(item)?.slug)}`}
              logo={rec(item)?.logo}
              banner={rec(item)?.banner}
            />
            <div className="grid grid-cols-2 my-gap my-my flex-1 items-stretch [&>*]:h-full">
              {mapList(sliceOf(fieldsOf(item).products, 0, 2), (product) => (
                <CardMain
                  key={idKey(product)}
                  product={product}
                  discountPrice={rec(product)?.discount_amount}
                  currentPrice={rec(product)?.final_price}
                  originalPrice={rec(product)?.regular_price}
                  discount={rec(product)?.discount}
                  discountPercentage={rec(product)?.discount_label}
                  rating={rec(product)?.rating}
                  image={rec(product)?.product_image}
                  link={rec(product)?.slug}
                  name={rec(product)?.name}
                  category={rec(product)?.category}
                  discountAmount={rec(product)?.price}
                  isStock={rec(product)?.is_stock}
                  from={"categories"}
                  categoryPageName={rec(rec(product)?.brand)?.name}
                  categoryPageLink={rec(rec(product)?.brand)?.slug}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {nodeOf(seo?.info_banner && (
        <div className="w-full h-30 lg:h-50 xl:h-60 my-4 lg:my-6 xl:my-8 overflow-hidden">
          <Image
            src={str(seo.info_banner) ?? ""}
            alt={str(seo?.title || "Brand Banner") ?? ""}
            width={4000}
            height={3000}
            className="w-full h-full object-cover rounded-2xl lg:rounded-3xl"
          />
        </div>
      ))}

      {/* Second Half Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {mapList(secondHalf, (item, index) => (
          <div key={idKey(item)} className="flex flex-col h-full">
            <SectionHeading
              title={rec(item)?.name}
              link={`/categories/${lowerOpt(rec(item)?.slug)}`}
              logo={rec(item)?.logo}
            />
            <div className="grid grid-cols-2 my-gap my-mt flex-1 items-stretch [&>*]:h-full">
              {mapList(sliceOf(fieldsOf(item).products, 0, 2), (product) => (
                <CardMain
                  key={idKey(product)}
                  product={product}
                  discountPrice={rec(product)?.discount_amount}
                  currentPrice={rec(product)?.final_price}
                  originalPrice={rec(product)?.regular_price}
                  discount={rec(product)?.discount}
                  discountPercentage={rec(product)?.discount_label}
                  rating={rec(product)?.rating}
                  image={rec(product)?.product_image}
                  link={rec(product)?.slug}
                  name={rec(product)?.name}
                  category={rec(product)?.category}
                  discountAmount={rec(product)?.price}
                  isStock={rec(product)?.is_stock}
                  from={"categories"}
                  categoryPageName={rec(rec(product)?.brand)?.name}
                  categoryPageLink={rec(rec(product)?.brand)?.slug}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CategoryList;
