import { getFlashSaleData } from "@/lib/api";
import ProductListJsonLd from "./ProductListJsonLd";

// Same limit the homepage Flash Sale slider uses, so the schema only lists
// products that are actually visible on the page (a schema.org/Google rule).
const HOME_FLASH_SALE_LIMIT = 12;

// Homepage content schema: CollectionPage -> ItemList -> Product for the
// flash-sale products rendered on it.
const HomeJsonLd = async () => {
  const { products } = await getFlashSaleData({ limit: HOME_FLASH_SALE_LIMIT });

  return (
    <ProductListJsonLd
      products={(products || []).slice(0, HOME_FLASH_SALE_LIMIT)}
      path="/"
      name="TEKZO – Trusted Smartphone, Gadget & Electronics Store in Bangladesh"
      listName="Flash Sale"
    />
  );
};

export default HomeJsonLd;
