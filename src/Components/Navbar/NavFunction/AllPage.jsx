import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import Link from "next/link";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const AllPage = ({ link, title, setIsSidebarOpen }) => {
  return (
    <span className="flex justify-center my-5 text-sm ">
      <PreFetchLink
        prefetch={false}
        href={link}
        onClick={() => setIsSidebarOpen(false)}
        className="bg-primary text-white py-1 px-4 rounded-full flex items-center"
      >
        {title}
        <MdOutlineKeyboardArrowRight className="text-2xl" />
      </PreFetchLink>
    </span>
  );
};

export default AllPage;
