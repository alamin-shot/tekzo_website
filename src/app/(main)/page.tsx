import { getSliders, getCategories, getBrands } from "@/lib/api";
import HomePage from "./HomePage";
import HomeJsonLd from "@/Components/SEO/HomeJsonLd";

const Home = async () => {
  const [slidersData, categoriesData, brands] = await Promise.all([
    getSliders(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div>
      <HomeJsonLd />
      <HomePage slidersData={slidersData} categoriesData={categoriesData} brands={brands}></HomePage>
    </div>
  );
};

export default Home;
