import Image from "next/image";
import React from "react";
import type { MyImageSquireProps } from "@/types/props/catalog";
import { str } from "@/lib/render";

const MyImageSquire = ({ src, alt }: MyImageSquireProps) => {
  return (
    <div className="w-full h-auto overflow-hidden">
      <Image src={str(src) ?? ""} alt={str(alt) ?? ""} width={800} height={3000} className=" w-full h-full object-cover object-center"></Image>
    </div>
  );
};

export default MyImageSquire;
