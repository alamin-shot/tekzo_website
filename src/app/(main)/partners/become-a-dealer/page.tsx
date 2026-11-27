"use client";

import BusinessRegisterFormHeader from "@/Components/Partners/BusinessRegisterFormHeader";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Form from "@/Components/ReuseableComponent/Form/BusinessForm";
import React, { useState } from "react";

const BecomeADealer = () => {
  const [formData, setFormData] = useState<unknown>(null);
  const title = "Dealer";

  return (
    <div>
      <Banner h1="Become a TEKZO Dealer" image={"/all-product-banner.webp"} title={"Become a B2B Partner"}></Banner>
      <main className="container">
        <Breadcrumbs></Breadcrumbs>
        <BusinessRegisterFormHeader title={title}></BusinessRegisterFormHeader>
        <Form title={title} setData={setFormData}></Form>
      </main>
    </div>
  );
};

export default BecomeADealer;
