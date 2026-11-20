import Image from "next/image";
import React from "react";

const MyImageSquire = ({ src, alt }) => {
  return (
    <div className="w-full h-auto overflow-hidden">
      <Image src={src} alt={alt} width={800} height={3000} className=" w-full h-full object-cover object-center"></Image>
    </div>
  );
};

export default MyImageSquire;
