import Banner from "@/Components/ReuseableComponent/Banner";
import FeatureProductAPI from "@/Components/FeatureProductFor404Page/FeatureProductAPI";
import ClientNotFoundContent from "../ClientNotFoundContent";

export default function NotFound() {
  return (
    <>
      <title>404 Page Not Found - Tekzo</title>
      <Banner
        image={"/all-product-banner.webp"}
        title={"not found page banner image"}
      />
      <ClientNotFoundContent />
      <FeatureProductAPI />
    </>
  );
}
