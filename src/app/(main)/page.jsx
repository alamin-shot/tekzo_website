import { getSliders, getCategories, getBrands } from "@/lib/api";
import HomePage from "./HomePage";

const Home = async () => {
  const slidersData = await getSliders();
  const categoriesData = await getCategories();
  const brands = await getBrands();

  return (
    <div>
      <HomePage slidersData={slidersData} categoriesData={categoriesData} brands={brands}></HomePage>
    </div>
  );
};

export default Home;
