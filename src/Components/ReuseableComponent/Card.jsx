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

const Card = ({
  name,
  category,
  categoryLink,
  badge,
  currentPrice,
  originalPrice,
  discountPercentage,
  rating,
  image,
  isStock,
  status,
  btnClick,
  productData,
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
    <div className="inline-block relative w-full aspect-[4/3]">
      {/* main bg image of card */}
      <Image
        src="/card/card-bg.png"
        alt="card bg"
        fill
        className="w-full"
      ></Image>
      {/* card bg shape */}
      <div className="absolute top-3 right-3 lg:top-5 lg:right-5 bg-gray-300/50 w-[50%] aspect-square rounded-xl lg:rounded-[40px] rounded-tr-2xl lg:rounded-tr-3xl"></div>
      <Link
        href={`/categories/${categoryLink}`}
        className="absolute top-1 md:top-4 left-2 md:left-4 lg:left-5 text-gray-500 capitalize text-[9px] md:text-xs xl:text-sm hover:text-primary"
      >
        {category}
      </Link>
      {badge && (
        <span className="absolute top-4.5 md:top-8 lg:top-9 xl:top-10 left-2 md:left-4 lg:left-5 bg-primary text-white text-[8px] lg:text-xs px-2 py-[1px] lg:py-0.5 rounded ">
          {badge}
        </span>
      )}

      <Link
        href={from === "preOwned" ? `/used-device/${link}` : `/product/${link}`}
        className={`absolute ${badge || category ? "top-6  2xl:top-18" : "top-5 md:top-6 lg:top-8"} left-4 xl:left-5  w-[calc(100%-2rem)] lg:w-[calc(100%-2.5rem)]`}
      >
        <div className="flex justify-center items-center  ">
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
        <Link
          href={
            from === "preOwned" ? `/used-device/${link}` : `/product/${link}`
          }
          className="mb-0 md:mb-2 xl:mb-3 "
        >
          <h3 className="text-gray-600 text-xs md:text-lg 2xl:text-xl lg:font-semibold">
            {name.length > 22 ? name.substring(0, 22) + "..." : name}
          </h3>
          <div className="flex items-center lg:gap-2 md:mb-1">
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-gray-600 text-xs md:text-xl lg:text-lg font-semibold md:font-bold tracking-tight">
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
            {from === "preOwned" && (
              <div className="ml-2 text-gray-600 text-[9px] md:text-xs lg:text-sm  ">
                <label>Quantity: </label>
                <span>{quantity}</span>
              </div>
            )}
          </div>
        </Link>
        <div className="w-[69%]">
          {from === "preOwned" ? (
            /* Pre-owned Button: Navigates instead of opening Modal */
            <Link
              href={`/used-device/${link}`}
              className={`relative inline-block p-[1px] md:p-[2px] rounded-full overflow-hidden transition-all duration-300 active:translate-y-0.5 active:shadow-xl w-full group ${
                isStock
                  ? "gradient cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <div className="bg-white rounded-full w-full h-full py-1 md:py-2.5 xl:py-3 px-8 flex justify-center items-center relative">
                <span
                  className={`text-[10px] md:text-sm xl:text-base font-semibold md:font-bold capitalize whitespace-nowrap ${
                    isStock
                      ? "bg-clip-text text-transparent gradient bg-fixed"
                      : "text-gray-500"
                  }`}
                >
                  {isStock ? "View Details" : "Out of Stock"}
                </span>

                {isStock && (
                  <MdArrowForwardIos className="absolute right-3 md:right-5 text-xs md:text-base xl:text-lg text-secondary" />
                )}
              </div>
            </Link>
          ) : (
            /* Standard Product Button: Opens Modal */
            <button
              onClick={() => isStock && setIsModalOpen(true)}
              className={`relative p-[1px] md:p-[2px] rounded-full overflow-hidden transition-all duration-300 active:translate-y-0.5 active:shadow-xl w-full group ${
                isStock
                  ? "gradient cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              disabled={!isStock}
            >
              <div className="bg-white rounded-full w-full h-full py-1 md:py-2.5 xl:py-3 px-8 flex justify-center items-center relative">
                <span
                  className={`text-[10px] md:text-sm xl:text-base font-semibold md:font-bold capitalize whitespace-nowrap ${
                    isStock
                      ? "bg-clip-text text-transparent gradient bg-fixed"
                      : "text-gray-500"
                  }`}
                >
                  {isStock ? "Add To Cart" : "Out of Stock"}
                </span>

                {isStock && (
                  <MdArrowForwardIos className="absolute right-3 md:right-5 text-xs md:text-base xl:text-lg text-secondary" />
                )}
              </div>
            </button>
          )}
        </div>
      </div>
      {/* product rating */}
      <div className="absolute right-0 bottom-0 w-[30px] h-[30px] md:w-16  md:h-16 lg:w-12 lg:h-12  xl:w-15 xl:h-15 2xl:w-17 2xl:h-17  rounded-full bg-[#F3F3F7] text-[8px] md:text-base lg:text-sm xl:text-base flex justify-center items-center font-semibold text-gray-500">
        <FaStar className="text-primary mr-0.5 md:mr-1 lg:mr-0.5 xl:mr-1 text-[9px] md:text-lg lg:text-sm " />
        {rating}
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

export default Card;
