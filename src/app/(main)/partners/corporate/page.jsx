"use client";

import BusinessRegisterFormHeader from "@/Components/Partners/BusinessRegisterFormHeader";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Form from "@/Components/ReuseableComponent/Form/BusinessForm";
import React, { useState } from "react";

const Corporate = () => {
  const [formData, setFormData] = useState(null);
  const title = "Corporate";

  return (
    <div>
      <Banner h1="TEKZO Corporate Partnership" image={"/all-product-banner.webp"} title={"Become a Corporate"}></Banner>
      <main className="container">
        <Breadcrumbs></Breadcrumbs>
        <BusinessRegisterFormHeader title={title}></BusinessRegisterFormHeader>
        <Form title={title} setData={setFormData}></Form>
      </main>
    </div>
  );
};

export default Corporate;
