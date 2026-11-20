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

const PreOwnedCard = ({
  name,
  currentPrice,
  originalPrice,
  discountPercentage,
  rating,
  image,
  isStock,
  link,
  from,
  quantity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedCart, setHasOpenedCart] = useState(false);
  if (isModalOpen && !hasOpenedCart) {
    setHasOpenedCart(true);
  }
  // Inputs
  currentPrice = Math.trunc(Number(currentPrice) || 0);
  originalPrice = Math.trunc(Number(originalPrice) || 0);

  return (
    <div className="inline-block relative w-full h-auto group">
      {/* main bg image of card */}
      <Image
        src="/card/preowned-card2.svg"
        alt="card bg"
        className="w-full opacity-40"
        width={4000}
        height={3000}
      ></Image>

      <Link
        href={`/used-device/${link}`}
        className=" absolute top-0 left-0  aspect-9/11 md:aspect-10/13 lg:aspect-6/7 xl:aspect-18/22 2xl:aspect-19/25  rounded-[7%] overflow-hidden group "
      >
        <div className=" flex justify-center items-center w-full h-full ">
          <Image
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            width={4000}
            height={3000}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="absolute -bottom-2 -left-2 -right-2  text-[9.5px] md:text-xs lg:text-sm xl:text-base px-2 md:px-4 xl:px-5 h-5 md:h-8 lg:h-10 xl:h-12 flex justify-between items-center  text-teal-600 font-light bg-[#eaeaea] w-full z-500"></div>
        <div className="absolute bottom-0 left-0  text-[9.5px] md:text-xs lg:text-sm xl:text-base px-2 md:px-4 xl:px-5 h-5 md:h-8 lg:h-10 xl:h-12 flex justify-between items-center  text-teal-600 font-light bg-[#eaeaea] w-full z-500">
          <p>Smartphone</p>
          <div className=" text-[9.5px] lg:text-sm">Quantity: {quantity}</div>
        </div>
      </Link>
      {/* card content */}
      <div className="absolute left-2 md:left-3 bottom-0 md:bottom-1.5 w-full z-10">
        <Link
          prefetch={false}
          href={`/used-device/${link}`}
          className="mb-0 md:mb-2 xl:mb-3 "
        >
          <h3 className="text-gray-900 text-[10px] md:text-lg xl:text-sm 2xl:text-base ">
            <div className="flex justify-between items-center w-[92%]">
              <div className="">
                {name.length > 22 ? name.substring(0, 22) + "..." : name}
              </div>
            </div>
            <hr className="w-[90%]  lg:w-[92%] text-gray-400 my-0.5 md:my-1 2xl:my-2" />
          </h3>
          <div className="flex items-center lg:gap-2 mb-1 lg:mb-2">
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-gray-700 text-xs md:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-semibold md:font-bold tracking-tight">
                ৳ {currentPrice?.toLocaleString()}
              </span>
              {originalPrice && discountPercentage && (
                <span className="text-gray-600 line-through text-[10px] md:text-sm font-normal">
                  ৳ {originalPrice?.toLocaleString()}
                </span>
              )}
            </div>
            {discountPercentage && (
              <span className="bg-primary/10 text-primary ml-1 md:ml-2 px-1 md:px-2 py-0.5 rounded text-[9px] md:text-xs font-semibold md:font-bold uppercase tracking-wide">
                {discountPercentage}
              </span>
            )}
          </div>
        </Link>
        <div className="w-[70%] lg:w-[70%] xl:w-[72%] 2xl:w-[78%]">
          <Link
            href={`/used-device/${link}`}
            className={`relative inline-block p-[1px] lg:p-[1.5px]  rounded-full overflow-hidden transition-all duration-300 active:translate-y-0.5 active:shadow-xl w-full group ${
              isStock
                ? "gradient cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <div className="bg-white rounded-full w-full h-full py-0.5 md:py-1.5 px-8 flex justify-center items-center relative">
              <span
                className={`text-[10px] md:text-sm xl:text-base font-semibold capitalize whitespace-nowrap ${isStock ? "bg-clip-text text-transparent gradient bg-fixed" : "text-gray-500"}`}
              >
                {isStock ? "View Details" : "Out of Stock"}
              </span>

              {isStock && (
                <MdArrowForwardIos className="absolute right-3 md:right-5 text-[11px] md:text-base xl:text-lg text-secondary" />
              )}
            </div>
          </Link>
        </div>
      </div>
      {/* product rating */}
      <div className="absolute -right-1 -bottom-1 lg:-right-2 lg:-bottom-2 bg-white rounded-full p-1 lg:p-1.5">
        <div className="bg-linear-to-br from-secondary to-primary rounded-full p-px lg:p-[1.5px] ">
          <div className="w-[28px] h-[28px] md:w-14  md:h-14 lg:w-13 lg:h-13  xl:w-15 xl:h-15 2xl:w-15 2xl:h-15 rounded-full bg-white text-primary  text-[8px] md:text-base lg:text-sm xl:text-base flex justify-center items-center ">
            <FaStar className="mr-0.5 md:mr-1 lg:mr-0.5 xl:mr-1 text-[8px] md:text-lg lg:text-sm" />
            <FaStar className="mr-0.5 md:mr-1 lg:mr-0.5 xl:mr-1 text-[8px] md:text-lg lg:text-sm" />
            {rating}
          </div>
        </div>
      </div>
      {hasOpenedCart && (
        <CartModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          name={name}
          currentPrice={currentPrice}
          image={image}
          slug={link}
        />
      )}
    </div>
  );
};

export default PreOwnedCard;
