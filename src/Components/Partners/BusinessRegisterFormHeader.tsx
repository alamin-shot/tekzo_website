import React from "react";
import Title2 from "../ReuseableComponent/Title2";
import Button from "../ReuseableComponent/Button";
import type { BusinessRegisterFormHeaderProps } from "@/types/props/content";

const BusinessRegisterFormHeader = ({ title }: BusinessRegisterFormHeaderProps) => {
  return (
    <header className="text-center mb-8 lg:mb-10">
      <Title2>Register for {title} Application Form</Title2>
      <p className="text-gray-700 text-sm mb-4">
        Write us at: <span className="text-blue-500">sales@salamatinnovation.com</span> or fill up the form.
      </p>
      <Button>download policy</Button>
    </header>
  );
};

export default BusinessRegisterFormHeader;
