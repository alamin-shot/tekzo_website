import dynamic from "next/dynamic";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import Title from "@/Components/ReuseableComponent/Title";
import TitleHeading from "@/Components/ReuseableComponent/TitleHeading";
import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Section from "@/Components/ReuseableComponent/Section";
import { getHomePreOwnedProducts } from "@/lib/api";

// swiper only ships to routes that actually render a slider
const UsedDeviceSectionHomePage = dynamic(
  () => import("./UsedDeviceSectionHomePageLazy"),
);

export default async function UsedDeviceHomePage() {
  const preOwnedProducts = await getHomePreOwnedProducts();

  return (
    <div>
      <Section>
        <TitleHeading>
          <Title>Certified Used Devices</Title>

          <div className="gradient rounded-full p-[1] md:p-0.5 group">
            <PreFetchLink
              prefetch={false}
              href={"/used-device"}
              className="text-sm rounded-full  py-1 md:py-2  px-2 md:px-4 bg-white flex gap-2 items-center group-hover:text-secondary duration-200"
            >
              See All{" "}
              <MdOutlineKeyboardArrowRight className=" bg-black text-white text-lg rounded-full group-hover:bg-secondary duration-200" />{" "}
            </PreFetchLink>
          </div>
        </TitleHeading>
        <UsedDeviceSectionHomePage products={preOwnedProducts} />
      </Section>
    </div>
  );
}
