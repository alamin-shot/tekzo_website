import type { ChildrenOnlyProps } from "@/types/props/catalog";
import React from "react";

const Button = ({ children }: ChildrenOnlyProps) => {
  return (
    <button type="button" className="bg-primary text-white capitalize py-1.5 lg:py-2 px-4 border-0 rounded-lg active:scale-95 duration-300 cursor-pointer">
      {children}
    </button>
  );
};

export default Button;
