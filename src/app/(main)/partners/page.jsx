"use client";

import PartnerCard from "@/Components/Partners/PartnerCard";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import React from "react";

const Partners = () => {
  return (
    <div className="">
      <Banner image={"/all-product-banner.webp"} title={"partners"}></Banner>
      <main className="container">
        <Breadcrumbs></Breadcrumbs>
        <PartnerCard></PartnerCard>
      </main>
    </div>
  );
};

export default Partners;
