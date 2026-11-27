"use client";

import BusinessRegisterFormHeader from "@/Components/Partners/BusinessRegisterFormHeader";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Button from "@/Components/ReuseableComponent/Button";
import Form from "@/Components/ReuseableComponent/Form/BusinessForm";
import Title2 from "@/Components/ReuseableComponent/Title2";
import React, { useState } from "react";

const B2bregister = () => {
  const [formData, setFormData] = useState<unknown>(null);
  const title = "B2B partnership";

  return (
    <div>
      <Banner h1="Become a TEKZO B2B Partner" image={"/all-product-banner.webp"} title={"Become a B2B Partner"}></Banner>
      <main className="container">
        <Breadcrumbs></Breadcrumbs>
        <BusinessRegisterFormHeader title={title}></BusinessRegisterFormHeader>
        <Form title={title} setData={setFormData}></Form>
      </main>
    </div>
  );
};

export default B2bregister;
