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

const PreOwnedCard2 = ({
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
    <div className="rounded-xl md:rounded-2xl xl:rounded-4xl bg-[#F3F2F7] group">
      <Link
        prefetch={false}
        href={`/used-device/${link}`}
        className=" relative "
      >
        <div className="relative w-full aspect-3/4 overflow-hidden rounded-xl md:rounded-2xl  xl:rounded-4xl">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 duration-200"
          />
          <div className="flex justify-between items-center absolute bottom-0 left-0 text-[11px] lg:text-xs xl:text-sm  w-full bg-[#eaeaea] px-2 lg:px-4 h-6 lg:h-8 xl:h-10 text-secondary">
            <p>Smartphone</p>
            <div className="">
              Quantity: <span className="font-semibold">{quantity}</span>
            </div>
          </div>
        </div>
      </Link>
      {/* card content */}
      <div className="p-1.5 lg:p-2.5 text-gray-700 relative">
        <Link prefetch={false} href={`/used-device/${link}`} className="">
          <h3 className="text-sm lg:text-base  border-b border-gray-300 pb-1 xl:pb-2">
            <div className="">
              <div className="">
                {name.length > 22 ? name.substring(0, 22) + "..." : name}
              </div>
            </div>
          </h3>
          <div className="pt-1 xl:pt-2">
            <div className="font-semibold lg:text-lg">
              <span className="">৳ {currentPrice?.toLocaleString()}</span>
              {originalPrice && discountPercentage && (
                <span className="">৳ {originalPrice?.toLocaleString()}</span>
              )}
            </div>
            {discountPercentage && (
              <span className="">{discountPercentage}</span>
            )}
          </div>
        </Link>

        <div className="flex mt-1 xl:mt-2 items-end">
          {isStock ? (
            <Link
              href={`/used-device/${link}`}
              className="w-[calc(100%-34px)] lg:w-[calc(100%-52px)] xl:w-[calc(100%-64px)] inline-block gradient rounded-full overflow-hidden p-px xl:p-[1.5px] transition-transform active:scale-95"
            >
              <div className="bg-white rounded-full flex items-center justify-center text-xs lg:text-sm gap-1 py-[3px] lg:py-1.5 xl:py-2 font-semibold">
                <span className="bg-linear-to-r from-[#18ac8f] to-[#f79904] bg-clip-text text-transparent">
                  View Details
                </span>
                <MdArrowForwardIos className="text-primary" />
              </div>
            </Link>
          ) : (
            <div className="w-[calc(100%-34px)] lg:w-[calc(100%-52px)] xl:w-[calc(100%-64px)] inline-block bg-gray-200 rounded-full overflow-hidden p-px xl:p-[1.5px] cursor-not-allowed">
              <div className="bg-gray-100 rounded-full flex items-center justify-center text-xs lg:text-sm gap-1 py-[3px] lg:py-1.5 xl:py-2 font-semibold">
                <span className="text-gray-400">Out of Stock</span>
              </div>
            </div>
          )}
          {/* product rating - FIXED CIRCLE */}
          <div className=" aspect-square w-10 lg:w-15 xl:w-18 absolute -bottom-1 -right-1 lg:-bottom-1.5 lg:-right-1.5">
            <div className=" w-full h-full aspect-square bg-white p-[3px] lg:p-1 xl:p-[5px]  rounded-full">
              <div className="gradient p-px xl:p-[1.5px] rounded-full">
                <div className="w-full h-full aspect-square whitespace-nowrap flex gap-px xl:gap-1 items-center justify-center rounded-full bg-[#F3F2F7] text-[10px] xl:text-sm text-primary">
                  <FaStar className="" />
                  <span className="">4.5{rating}</span>
                </div>
              </div>
            </div>
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

export default PreOwnedCard2;
