import Categories from "@/Components/Home/Categories/Categories";
import Features from "@/Components/Home/FeaturesProduct/Features";
import FlashSale from "@/Components/Home/FlashSale/FlashSale";
import Brands from "@/Components/Home/Brands/Brands";
import LiveSection from "@/Components/Home/LiveSection/LiveSection";
import UsedDeviceHomePage from "@/Components/Home/UsedDeviceHomePage/UsedDeviceHomePage";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import HomeBanner from "@/Components/ReuseableComponent/HomeBanner";
import TrustFeatures from "@/Components/Home/TrustFeatures/TrustFeatures";
import WhyChooseTekzo from "@/Components/Home/WhyChooseTekzo/WhyChooseTekzo";
import HomeFAQ from "@/Components/Home/HomeFAQ/HomeFAQ";
import { getSettings } from "@/lib/api";
import NewArrival from "@/Components/Home/NewArrival/NewArrival";

const HomePage = async ({ slidersData, categoriesData, brands }) => {
  const companySetting = await getSettings();
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
      <HomeFAQ />
      <PageDescription className="!mt-0" title="More About Tekzo" description={companySetting?.seoData?.long_description} />
    </main>
  );
};

export default HomePage;
