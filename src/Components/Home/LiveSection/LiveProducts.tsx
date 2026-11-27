"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LiveProductModal from "./LiveProductModal";
import type { LiveProductsProps, ReelCardItem, ReelCardProps } from "@/types/props/home";
import { fieldsOf, localeOpt, mapList, rec } from "@/lib/json";
import { keyFrom, nodeOf, str } from "@/lib/render";

function isVideoUrl(url: unknown) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(String(url));
}

function ProductCard({ product, onClick }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Only decode/play a reel while it's on screen. iOS WebKit kills the tab
  // (Chrome: "Can't open this page") when several videos keep decoding at
  // once, e.g. while the keyboard opens for the search modal.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [product.videoLink]);

  return (
    <div
      className="group relative flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-full aspect-[3/5] rounded-t-2xl lg:rounded-t-4xl overflow-hidden  z-0">
        {isVideoUrl(product.videoLink) ? (
          <video
            ref={videoRef}
            src={str(product.videoLink)}
            muted
            preload="metadata"
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover lg:transition-transform lg:duration-700 lg:group-hover:scale-110"
          >
            <track kind="captions" srcLang="bn" />
          </video>
        ) : (
          <Image
            src={str(product.videoLink || product.image || "/placeholder.jpg") ?? ""}
            alt={str(product.name) ?? ""}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
      </div>

      <div className="relative -mt-15 lg:-mt-18 2xl:-mt-22 z-10 w-full">
        <div className="relative w-full">
          <Image
            src="/reels-shape2.svg"
            alt="shape"
            width={300}
            height={150}
            className="w-full h-auto block"
            loading="lazy"
          />

          <div className="absolute inset-0 px-3 md:px-4 pt-5 lg:pt-9">
            <div className="absolute top-2 lg:top-2.5 2xl:top-4 left-[34px] lg:left-[36px] 2xl:left-13  w-8 h-8 lg:w-9 lg:h-9 2xl:w-11 2xl:h-11 rounded-full overflow-hidden ">
              <Image
                src={str(product.image) ?? ""}
                alt={str(product.name) ?? ""}
                width={48}
                height={48}
                sizes="48px"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="absolute left-4/6 -translate-x-1/2 mt-0.5 lg:-mt-2 2xl:-mt-0.5 p-2 text-[10px] lg:text-[12px] font-bold text-primary uppercase tracking-tight mb-0.5">
              {nodeOf(product.brand)}
            </span>
            <div className="space-y-1 mt-10 lg:mt-7 2xl:mt-12">
              <h3 className="text-[11px] lg:text-[15px] mt-1 font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {nodeOf(product.name)}
              </h3>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[14px] lg:text-lg font-bold text-gray-900">
                    {product.price}
                  </span>
                  {Number(product.originalPrice) > 0 &&
                    product.originalPrice !== product.currentPrice && (
                      <span className="text-[10px] lg:text-[12px] text-gray-600 line-through">
                        ৳{localeOpt(product.originalPrice)}
                      </span>
                    )}
                </div>
                {product.discount ? (
                  <span className="text-[9px] lg:text-xs font-bold text-red-500  block mt-[-2px]">
                    {nodeOf(product.discount)}
                  </span>
                ) : (
                  nodeOf(product.discount)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveProducts({ reels = [] }: LiveProductsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // `reel.id` threw for a null reel; fieldsOf keeps that.
  const products = mapList(reels, (entry): ReelCardItem => {
    const reel = fieldsOf(entry);
    const product = rec(reel.product);
    return {
    id: reel.id,
    name: product?.product_name || "",
    brand: rec(product?.brand)?.name || "",
    price: `৳${Number(product?.final_price || 0).toLocaleString()}`,
    currentPrice: product?.final_price || 0,
    originalPrice: product?.regular_price || 0,
    discount: product?.discount_label || "",
    image: product?.product_image || "/placeholder.jpg",
    videoLink: reel.video_link || "/demo-section.mp4",
  };
  });

  const openModal = (index: number) => {
    setActiveIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <ProductCard
            key={keyFrom(product.id)}
            product={product}
            onClick={() => openModal(i)}
          />
        ))}
      </div>
      <LiveProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={reels}
        initialIndex={activeIndex}
      />
    </>
  );
}
