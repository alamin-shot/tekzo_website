import React from "react";
import { MdArrowForwardIos } from "react-icons/md";

const MyButton = ({ children }) => {
  return (
    <button className="relative py-1 md:py-1.5 xl:py-3 px-8 whitespace-nowrap text-[10px] md:text-sm xl:text-base rounded-full gradient text-white font-semibold capitalize cursor-pointer w-full flex justify-center items-center overflow-hidden transition-all duration-300 active:translate-y-0.5 active:shadow-xl">
      {children} <MdArrowForwardIos className="absolute right-1 md:right-3 text-xs md:text-base xl:text-lg" />
    </button>
  );
};

export default MyButton;
