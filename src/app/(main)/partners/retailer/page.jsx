"use client";

import BusinessRegisterFormHeader from "@/Components/Partners/BusinessRegisterFormHeader";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Button from "@/Components/ReuseableComponent/Button";
import Form from "@/Components/ReuseableComponent/Form/BusinessForm";
import Title2 from "@/Components/ReuseableComponent/Title2";
import React, { useState } from "react";

const Retailer = () => {
  const [formData, setFormData] = useState(null);
  const title = "Retailer";

  return (
    <div>
      <Banner h1="Become a TEKZO Retailer" image={"/all-product-banner.webp"} title={"Become a Retailer"}></Banner>
      <main className="container">
        <Breadcrumbs></Breadcrumbs>
        <BusinessRegisterFormHeader title={title}></BusinessRegisterFormHeader>
        <Form title={title} setData={setFormData}></Form>
      </main>
    </div>
  );
};

export default Retailer;
