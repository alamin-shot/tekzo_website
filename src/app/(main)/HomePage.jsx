import dynamic from "next/dynamic";
import Categories from "@/Components/Home/Categories/Categories";
import Features from "@/Components/Home/FeaturesProduct/Features";
import FlashSale from "@/Components/Home/FlashSale/FlashSale";
import Brands from "@/Components/Home/Brands/Brands";
import LiveSection from "@/Components/Home/LiveSection/LiveSection";
import UsedDeviceHomePage from "@/Components/Home/UsedDeviceHomePage/UsedDeviceHomePage";
import HomeBanner from "@/Components/ReuseableComponent/HomeBanner";
import { getSettings } from "@/lib/api";
import { getHomeCustomerQuote } from "@/lib/homeQuote";
import NewArrival from "@/Components/Home/NewArrival/NewArrival";
import { formatHtml } from "@/lib/formatHtml";

// Below-the-fold client components lazy-loaded to cut initial JS chunk and CPU time
const TrustFeatures = dynamic(() => import("@/Components/Home/TrustFeatures/TrustFeatures"));
const WhyChooseTekzo = dynamic(() => import("@/Components/Home/WhyChooseTekzo/WhyChooseTekzo"));
const HomeFAQ = dynamic(() => import("@/Components/Home/HomeFAQ/HomeFAQ"));
// The homepage formats/sanitizes its description on the server and renders
// the display-only view, so DOMPurify (~11 KB gz) is not in its client bundle.
const PageDescriptionView = dynamic(() => import("@/Components/ReuseableComponent/PageDescriptionView"));

const HomePage = async ({ slidersData, categoriesData, brands }) => {
  const [companySetting, customerQuote] = await Promise.all([getSettings(), getHomeCustomerQuote()]);
  const rawDesc = companySetting?.seoData?.long_description;
  const homeDesc = typeof rawDesc === "string" ? rawDesc.trim() : "";
  const homeDescHtml = homeDesc ? formatHtml(homeDesc) : "";
  return (
    <main className="flex flex-col gap-6 md:gap-8 lg:gap-10">
      <h1 className="sr-only">TEKZO – Trusted Smartphone, Gadget & Electronics Store in Bangladesh</h1>
      <HomeBanner slidersData={slidersData} />
      <Categories slidersData={slidersData} categoriesData={categoriesData}></Categories>
      <FlashSale slidersData={slidersData}></FlashSale>
      <Brands brands={brands} />
      <Features slidersData={slidersData} brands={brands}></Features>
      <NewArrival />
      <LiveSection></LiveSection>
      <UsedDeviceHomePage></UsedDeviceHomePage>
      <TrustFeatures></TrustFeatures>
      <WhyChooseTekzo></WhyChooseTekzo>
      <HomeFAQ customerQuote={customerQuote} />
      <PageDescriptionView className="!mt-0" title="More About Tekzo" html={homeDescHtml} />
    </main>
  );
};

export default HomePage;
