import CardMain from "@/Components/ReuseableComponent/CardMain";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";

const FeaturedProductsList = ({ products = [], searchQuery = "" }) => {
  const productList = Array.isArray(products)
    ? products
    : products?.data || products?.products || [];

  if (!productList.length) {
    return <NoProductFound />;
  }

  // Filter products by search query if provided
  let filteredProducts = productList;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredProducts = productList.filter((product) => {
      const nameMatch = (product?.product_name || product?.name || "")
        .toLowerCase()
        .includes(query);
      const categoryMatch = (product?.category?.name || product?.category || "")
        .toLowerCase()
        .includes(query);
      const brandMatch = (product?.brand?.name || product?.brand || "")
        .toLowerCase()
        .includes(query);
      return nameMatch || categoryMatch || brandMatch;
    });
  }

  if (filteredProducts.length === 0) {
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
      {filteredProducts.map((product) => (
        <CardMain
          key={product.id || product._id || product.slug}
          product={product}
          name={product?.product_name || product?.name}
          category={product?.category?.name || product?.category}
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
          from={"featured-products"}
        />
      ))}
    </div>
  );
};

export default FeaturedProductsList;
