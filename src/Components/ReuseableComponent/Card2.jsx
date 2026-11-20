"use client";

import Image from "next/image";
import { MdArrowForwardIos } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

// framer-motion + the modal UI only ship once the user actually opens it,
// instead of bloating every listing page's initial JS bundle.
const CartModal = dynamic(() => import("./CartModal"), { ssr: false });

const Card2 = ({
  name,
  category,
  discountPrice,
  originalPrice,
  discount,
  rating,
  image,
  status,
  btnClick,
  productData,
  link,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedCart, setHasOpenedCart] = useState(false);
  if (isModalOpen && !hasOpenedCart) {
    setHasOpenedCart(true);
  }
  return (
    <div className="inline-block relative w-full h-auto">
      {/* main bg image of card */}
      <Image
        src="/card/card-bg.png"
        alt="card bg"
        className="w-full "
        width={4000}
        height={3000}
      ></Image>
      {/* card bg shape */}
      <div className="absolute top-4 right-4 lg:right-5 bg-gray-300/50 w-[50%] aspect-square rounded-3xl lg:rounded-[40px] rounded-tr-2xl lg:rounded-tr-3xl"></div>
      <p className="absolute top-2 md:top-4 left-2 md:left-4 lg:left-5 text-gray-500 capitalize text-[9px] md:text-xs xl:text-sm">
        {category}
      </p>

      <Link
        prefetch={false}
        href={`${link}`}
        className="absolute top-8 left-4 lg:left-5  w-[calc(100%-2rem)] lg:w-[calc(100%-2.5rem)] "
      >
        <div className="flex justify-center items-center ">
          <Image
            src={image}
            alt={name}
            className="w-[60%] h-auto"
            width={4000}
            height={3000}
            sizes="(max-width: 768px) 30vw, 15vw"
          ></Image>
        </div>
      </Link>
      {/* card content */}
      <div className="absolute left-2 md:left-4 bottom-2 md:bottom-3.5 w-full z-10">
        <div className="mb-0.5 md:mb-2 xl:mb-3">
          <h2 className="text-gray-600 text-xs md:text-lg lg:text-base xl:text-xl font-semibold line-clamp-1">
            {name}
          </h2>
          <div className="flex gap-2 md:gap-6 items-center mt-0 xl:mt-1">
            <div className="flex items-center gap-1 md:gap-3 mt-1 text-left">
              <span className="text-gray-600 text-xs md:text-xl lg:text-sm xl:text-xl font-semibold">
                ৳ {discountPrice}
              </span>
              {/* <span className="text-gray-400 line-through text-[10px] md:text-sm lg:text-xs xl:text-sm font-medium">৳ {originalPrice}</span> */}
            </div>
            {/* <p className=" inline-block bg-primary text-white px-2 md:px-3 xl:px-4 py-[1px] md:py-1 lg:py-0.5 xl:lg:py-1 rounded-lg text-[8px] md:text-xs lg:text-[10px] xl:text-xs">
              {discount}% off
            </p> */}
          </div>
        </div>
        {/* button */}
        <div className="w-[69%]">
          <button
            onClick={() => {
              btnClick(productData);
              setIsModalOpen(true);
            }}
            className="relative py-1 md:py-1.5 xl:py-3 px-8 whitespace-nowrap text-[10px] md:text-sm xl:text-base rounded-full gradient text-white font-normal md:font-semibold capitalize cursor-pointer w-full flex justify-center items-center overflow-hidden transition-all duration-300 active:translate-y-0.5 active:shadow-xl"
          >
            Add To Cart{" "}
            <MdArrowForwardIos className="absolute right-1 md:right-3 text-xs md:text-base xl:text-lg" />
          </button>
        </div>
      </div>
      {/* product rating */}
      <div className="absolute right-0 bottom-0 w-[30px] h-[30px] md:w-16  md:h-16 lg:w-12 xl:w-17 lg:h-12 xl:h-17 rounded-full bg-[#F3F3F7] text-[8px] md:text-base lg:text-sm xl:text-base flex justify-center items-center font-semibold text-gray-500">
        <FaStar className="text-primary mr-0.5 md:mr-1 lg:mr-0.5 xl:mr-1 text-[9px] md:text-lg lg:text-sm " />
        {rating}
      </div>
      {hasOpenedCart && (
        <CartModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          name={name}
          currentPrice={discountPrice}
          image={image}
          slug={link?.split("/").filter(Boolean).pop()}
        />
      )}
    </div>
  );
};

export default Card2;
