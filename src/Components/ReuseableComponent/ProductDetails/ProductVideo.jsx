import React, { useEffect, useRef } from "react";

// const products = [
//   {
//     id: 1,
//     title: "coming soon...",
//     videoSrc: "/product-details/demo-video.mp4",
//   },
//   {
//     id: 2,
//     title: "coming soon...",
//     videoSrc: "/product-details/demo-video.mp4",
//   },
//   {
//     id: 3,
//     title: "coming soon...",
//     videoSrc: "/product-details/demo-video.mp4",
//   },
//   {
//     id: 4,
//     title: "coming soon...",
//     videoSrc: "/product-details/demo-video.mp4",
//   },
// ];

export default function ProductVideo({ productDetails }) {
  return (
    <div className="w-full my-5 2xl:mb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        {productDetails?.videos.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// Separate component for each card to manage individual video refs safely
function ProductCard({ product }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // Ensures video plays even if the browser tries to block autoplay initially
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        throw error;
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center group cursor-pointer w-full ">
      {/* Video Container with Aspect Ratio matched to your screenshot */}
      <div className=" w-full aspect-[4/5] rounded-2xl lg:rounded-4xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
        <video ref={videoRef} src={product?.video_link} className="w-full h-full object-cover transition-transform duration-500 " loop muted playsInline autoPlay />
      </div>

      {/* Title */}
      {/* <h3 className="mt-3 text-sm md:text-base font-semibold text-gray-800 text-center tracking-wide">
        {product.title}
      </h3> */}
    </div>
  );
}
