import { RxDashboard } from "react-icons/rx";
import { BsShopWindow } from "react-icons/bs";
import Image from "next/image";
import { MdKeyboardArrowUp } from "react-icons/md";
import type { CompanySettingProps } from "@/types/props/layout";
import SidebarFunction from "./NavFunction/SidebarFunction";
import NavHoverEffect from "./NavFunction/NavHoverEffect";
import NavAuthClient from "./NavAuthClient";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";
import { getCategories, getBrands } from "@/lib/api";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";

const Navbar2 = async ({ companySetting }: CompanySettingProps) => {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  const ecommerceType = process.env.NEXT_PUBLIC_ECOMMERCE_TYPE;

  return (
    <nav className="xl:mb-1.5 lg:mx-25 2xl:mx-30 px-3 flex justify-between items-center fixed bottom-3 left-0 right-0 z-[3000] ">
      {/* Left side menu container */}
      <div className="w-full flex items-center bg-[#002620] h-[60px] lg:h-[50px] rounded-l-full rounded-tr-full lg:rounded-tr-none z-10 -mr-10 lg:-mr-0.5 ">
        <div className="w-full">
          {/* item for small screen */}
          <div className="flex w-full justify-evenly lg:hidden">
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
      </div>

      {/* FIXED MIDDLE LOGO/SVG AREA */}
      <div className="relative w-max h-[48.5px] flex items-center shrink-0 pb-1 ">
        <Image
          src="/navbar/navbar-middle.svg"
          alt="navbar middle shape svg"
          width={70}
          height={46}
          className="w-auto h-[64px] lg:h-[53px]"
          loading="lazy"
        />
        <PreFetchLink prefetch={false} href={"/"}>
          <Image
            src={str(rec(companySetting)?.company_logo) ?? ""}
            alt="logo"
            width={40}
            height={40}
            className="absolute left-1/2 -translate-x-1/2 -top-[0px] lg:top-1 ml-0.5 w-10 lg:w-9"
            loading="lazy"
          />
        </PreFetchLink>

        <div className="absolute left-1/2 -translate-x-1/2 top-[26px] lg:top-6 nav-item-lg text-white">
          <PreFetchLink prefetch={false} href={"/"} className={``}>
            Home
          </PreFetchLink>
        </div>
      </div>

      {/* Right side menu container */}
      <div className="w-full flex items-center bg-[#002620] h-[60px] lg:h-[50px] rounded-tl-full lg:rounded-tl-none rounded-r-full z-10 -ml-10 lg:-ml-0.5">
        <div className="w-full">
          <NavAuthClient />
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;
