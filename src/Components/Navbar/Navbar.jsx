import { RxDashboard } from "react-icons/rx";
import { BsShopWindow } from "react-icons/bs";
import Image from "next/image";
import { MdKeyboardArrowUp } from "react-icons/md";
import SidebarFunction from "./NavFunction/SidebarFunction";
import NavHoverEffect from "./NavFunction/NavHoverEffect";
import NavbarAuthSection from "./NavbarAuthSection";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";
import { getCategories, getBrands } from "@/lib/api";

const Navbar = async ({ companySetting }) => {
  const categories = await getCategories();
  const brands = await getBrands();
  const ecommerceType = process.env.NEXT_PUBLIC_ECOMMERCE_TYPE;

  return (
    <nav className="xl:mb-1.5 mx-3 md:mx-5 lg:mx-20 xl:mx-35 px-3 py-2 lg:py-2 bg-black/70 backdrop-blur-[3px] rounded-2xl lg:rounded-full flex justify-between items-center fixed bottom-3 left-0 right-0 z-[3000]">
      <div className="w-full">
        {/* item for small screen */}
        <div className="flex w-full justify-around lg:hidden">
          <SidebarFunction categories={categories} brands={brands} companySetting={companySetting}>
            <span className="nav-item">
              <RxDashboard className="nav-icon" />
              <p>Menu</p>
            </span>
          </SidebarFunction>
          <PreFetchLink prefetch={false} href={"/shop"} className="nav-item">
            <BsShopWindow className="nav-icon" />
            <p>Shop</p>
          </PreFetchLink>
        </div>
        {/* item for lg screen */}
        <div className="hidden lg:flex justify-evenly ">
          <NavHoverEffect title={"categories"} categories={categories}>
            <PreFetchLink
              prefetch={false}
              href={"/categories"}
              className="nav-item-lg py-1"
            >
              Categories <MdKeyboardArrowUp className="text-2xl" />
            </PreFetchLink>
          </NavHoverEffect>

          <NavHoverEffect title={"brand"} brands={brands}>
            <PreFetchLink
              prefetch={false}
              href={"/brands"}
              className="nav-item-lg py-1"
            >
              Brands
              <MdKeyboardArrowUp className="text-2xl" />
            </PreFetchLink>
          </NavHoverEffect>

          {ecommerceType && ecommerceType === "salamat" && (
            <NavHoverEffect title={"partners"}>
              <PreFetchLink
                prefetch={false}
                href={"/partners"}
                className="nav-item-lg py-1"
              >
                Partners <MdKeyboardArrowUp className="text-2xl" />
              </PreFetchLink>
            </NavHoverEffect>
          )}

          <PreFetchLink
            prefetch={false}
            href={"/shop"}
            className="nav-item-lg py-1"
          >
            Shop
          </PreFetchLink>
        </div>
      </div>
      {/* logo */}
      <PreFetchLink
        href={"/"}
        className="relative flex justify-center items-center w-45 md:w-40 lg:w-30 mx-9"
      >
        <svg
          className="absolute -z-10  mt-2.5"
          width="100"
          height="50"
          viewBox="0 0 100 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M97.344,25.165v3.718a9.8,9.8,0,0,1-9.8,9.8H9.8a9.8,9.8,0,0,1-9.8-9.8V25.816a9.8,9.8,0,0,1,6.129-9.084L45.811.712a9.794,9.794,0,0,1,7.335,0L91.215,16.081a9.8,9.8,0,0,1,6.129,9.084"
            fill="#fff"
          />
        </svg>

        <Image
          src={companySetting?.company_logo || "/nav-logo.png"}
          alt={companySetting?.company_name || "TEKZO"}
          className="w-full mt-2"
          width={4000}
          height={3000}
        ></Image>
      </PreFetchLink>
      <div className="w-full">
        {/* auth-dependent nav items (client component — does not affect SSG) */}
        <NavbarAuthSection />
      </div>
    </nav>
  );
};

export default Navbar;
