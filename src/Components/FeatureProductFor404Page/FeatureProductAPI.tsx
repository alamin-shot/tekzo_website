import dynamic from "next/dynamic";
import Title from "../ReuseableComponent/Title";
import { getFeaturedProducts } from "@/lib/api";

// swiper only ships to routes that actually render a slider
const FeatureProductFor404Page = dynamic(
  () => import("./FeatureProductFor404Page"),
);

export default async function FeatureProductAPI() {
  const products = await getFeaturedProducts();


  return (
    <div>
      <Title>Trending Products</Title>
      <FeatureProductFor404Page products={products} />
    </div>
  );
}
