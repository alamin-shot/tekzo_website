import SectionHeading from "@/Components/ReuseableComponent/SectionHeading";
import Image from "next/image";
import CardMain from "../ReuseableComponent/CardMain";
import { getCategoryProducts } from "@/lib/api";

async function getCatProducts() {
  const result = await getCategoryProducts();
  if (result?.data) {
    return {
      categories: result.data.categories || [],
      seoData: result.data.seoData || {},
    };
  }
  if (Array.isArray(result)) return { categories: result, seoData: {} };
  return { categories: [], seoData: {} };
}

const CategoryList = async ({ categoryFilter = "", searchQuery = "" }) => {
  const { categories, seoData } = await getCatProducts();

  if (!categories.length) {
    return (
      <p className="text-center text-gray-500 py-10">No categories found</p>
    );
  }

  // Filter categories based on categoryFilter
  let filteredCategories = categoryFilter
    ? categories.filter((cat) => cat.slug === categoryFilter)
    : categories;

  // Filter by search query if provided
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredCategories = filteredCategories.filter((category) => {
      // Search in category name
      const categoryMatch = category.name?.toLowerCase().includes(query);

      // Search in product names within the category
      const productsMatch = category.products?.some(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.brand?.name?.toLowerCase().includes(query),
      );

      return categoryMatch || productsMatch;
    });

    // If searching within products, also filter products within categories
    filteredCategories = filteredCategories
      .map((category) => ({
        ...category,
        products: category.products.filter(
          (product) =>
            product.name?.toLowerCase().includes(query) ||
            product.brand?.name?.toLowerCase().includes(query) ||
            category.name?.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.products.length > 0);
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-lg mb-2">
          {searchQuery
            ? `No results found for "${searchQuery}"`
            : "No products found for this category"}
        </p>
        {searchQuery && (
          <p className="text-gray-400 text-sm">
            Try searching with different keywords
          </p>
        )}
      </div>
    );
  }

  const midPoint = Math.ceil(filteredCategories.length / 2);
  const firstHalf = filteredCategories.slice(0, midPoint);
  const secondHalf = filteredCategories.slice(midPoint);

  return (
    <>
      {/* First Half Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {firstHalf.map((item, index) => (
          <div key={item.id} className="flex flex-col h-full">
            <SectionHeading
              title={item?.name}
              link={`/categories/${item?.slug?.toLowerCase()}`}
              logo={item?.logo}
              banner={item?.banner}
            />
            <div className="grid grid-cols-2 my-gap my-my flex-1 items-stretch [&>*]:h-full">
              {item.products.slice(0, 2).map((product) => (
                <CardMain
                  key={product.id}
                  product={product}
                  discountPrice={product?.discount_amount}
                  currentPrice={product?.final_price}
                  originalPrice={product?.regular_price}
                  discount={product?.discount}
                  discountPercentage={product?.discount_label}
                  rating={product?.rating}
                  image={product?.product_image}
                  link={product?.slug}
                  name={product?.name}
                  category={product?.category}
                  discountAmount={product?.price}
                  isStock={product?.is_stock}
                  from={"categories"}
                  categoryPageName={product?.brand?.name}
                  categoryPageLink={product?.brand?.slug}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {seoData?.info_banner && (
        <div className="w-full h-30 lg:h-50 xl:h-60 my-4 lg:my-6 xl:my-8 overflow-hidden">
          <Image
            src={seoData.info_banner}
            alt={seoData?.title || "Brand Banner"}
            width={4000}
            height={3000}
            className="w-full h-full object-cover rounded-2xl lg:rounded-3xl"
          />
        </div>
      )}

      {/* Second Half Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {secondHalf.map((item, index) => (
          <div key={item.id} className="flex flex-col h-full">
            <SectionHeading
              title={item?.name}
              link={`/categories/${item?.slug?.toLowerCase()}`}
              logo={item?.logo}
            />
            <div className="grid grid-cols-2 my-gap my-mt flex-1 items-stretch [&>*]:h-full">
              {item.products.slice(0, 2).map((product) => (
                <CardMain
                  key={product.id}
                  product={product}
                  discountPrice={product?.discount_amount}
                  currentPrice={product?.final_price}
                  originalPrice={product?.regular_price}
                  discount={product?.discount}
                  discountPercentage={product?.discount_label}
                  rating={product?.rating}
                  image={product?.product_image}
                  link={product?.slug}
                  name={product?.name}
                  category={product?.category}
                  discountAmount={product?.price}
                  isStock={product?.is_stock}
                  from={"categories"}
                  categoryPageName={product?.brand?.name}
                  categoryPageLink={product?.brand?.slug}
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
