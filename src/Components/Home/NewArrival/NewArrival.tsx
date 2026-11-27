import dynamic from "next/dynamic";
import { getHomeNewArrivalProducts } from "@/lib/api";
import TitleHeading from "@/Components/ReuseableComponent/TitleHeading";
import Title from "@/Components/ReuseableComponent/Title";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const NewArrivalSliders = dynamic(() => import("./NewArrivalSliders"));

const NewArrival = async () => {
  const products = await getHomeNewArrivalProducts();

  if (!products?.length) {
    return null;
  }

  return (
    <div className="">
      <TitleHeading>
        <Title>New Arrival</Title>

        <div className="gradient rounded-full p-[1px] md:p-0.5 group">
          <PreFetchLink
            prefetch={false}
            href={"/new-arrival-products"}
            className="text-sm rounded-full py-1 md:py-2 px-2 md:px-4 bg-white flex gap-2 items-center group-hover:text-secondary duration-200"
          >
            See All <MdOutlineKeyboardArrowRight className="bg-black text-white text-lg rounded-full group-hover:bg-secondary duration-200" />{" "}
          </PreFetchLink>
        </div>
      </TitleHeading>

      <div>
        <NewArrivalSliders products={products} />
      </div>
    </div>
  );
};

export default NewArrival;
