import Image from "next/image";
import Link from "next/link";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const SectionHeading = ({ logo, link, title, banner }) => {
  const backgroundImage =
    banner && banner.includes("cloudfront.net")
      ? banner
      : "/all-product-banner.webp";

  return (
    <div
      className="flex justify-between items-center h-20 lg:h-24 bg-cover bg-center bg-no-repeat rounded-2xl lg:rounded-3xl px-4 -mb-1"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="flex gap-3 lg:gap-5 items-center">
        <Image
          src={logo}
          alt={title ?? "Heading logo"}
          height={300}
          width={300}
          className="w-10 h-10 lg:w-12 lg:h-12 text-xl lg:text-3xl bg-dark text-white p-2 rounded-xl object-contain"
        ></Image>{" "}
        <h2 className="text-xl lg:text-3xl font-medium text-white text-shadow-2xs text-shadow-gray-500">
          {title}
        </h2>
      </div>
      <div className="gradient rounded-full p-[1] md:p-0.5 group">
        <Link
          prefetch={false}
          href={`${link}`}
          className="text-sm rounded-full py-1 md:py-2 px-2 md:px-4 bg-white flex gap-2 items-center group-hover:text-secondary duration-200"
        >
          See All{" "}
          <MdOutlineKeyboardArrowRight className="bg-black text-white text-lg rounded-full group-hover:bg-secondary duration-200" />
        </Link>
      </div>
    </div>
  );
};

export default SectionHeading;
