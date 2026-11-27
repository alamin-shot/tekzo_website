import { buildMetadata } from "@/utils/buildMetadata";
import { getSeoPage } from "@/lib/api";
import ProductComparisonHero from "@/Components/Comparison/ProductComparisonHero";

export async function generateMetadata() {
  const seo = await getSeoPage("compare");
  return buildMetadata(seo, "compare", "/all-product-banner.webp");
}

export default async function Compare() {
  const seoData = await getSeoPage("compare");
  return <ProductComparisonHero seoData={seoData}/>;
}
