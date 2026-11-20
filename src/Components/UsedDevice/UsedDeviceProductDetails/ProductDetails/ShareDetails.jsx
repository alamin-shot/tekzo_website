"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const ShareDetails = ({ selectedVariant, quantity = 1, supportPhone }) => {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const rawNumber = supportPhone || "";
  const cleanPhoneNumber = rawNumber.replace(/\D/g, "");
  const msg = "Hello! I want to know more about this product.";
  const whatsappMsg = `${currentUrl}\n\n${msg}`;
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  // Facebook Messenger URL for tekzobd page
  const facebookPageId = "tekzobd"; // Facebook page username
  const messengerMsg = `${currentUrl}\n\n${msg}`;
  const messengerUrl = `https://m.me/${facebookPageId}?text=${encodeURIComponent(messengerMsg)}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Product Inquiry", url: currentUrl });
      } catch (err) {
        throw err;
      }
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert("Link copied to clipboard!");
    }
  };

  // Removed background, shadow, and fixed dimensions for a "raw image" look
  const iconStyle =
    "transition-transform duration-300 group-hover:-translate-y-0.5 shrink-0 flex items-center justify-center";
  const btnBase =
    "group flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-2.5 lg:py-2 xl:px-3 xl:py-2 2xl:px-4 2xl:py-3 rounded-xl lg:rounded-2xl text-[8px] sm:text-[8.5px] lg:text-[9px] xl:text-[9.5px] 2xl:text-[10.5px] font-semibold uppercase tracking-wider text-white shadow-sm cursor-pointer select-none transition-all duration-200 hover:opacity-95 whitespace-nowrap";
  const imgClass = "w-6 lg:w-7 xl:w-8 2xl:w-10 aspect-square object-contain";

  return (
    <div className="grid grid-cols-3 gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-3 lg:mb-2">
      {/* WhatsApp */}
      <Link
        prefetch={false}
        href={whatsappUrl}
        target="_blank"
        className={`${btnBase} bg-gradient-to-br from-[#25D366] to-[#139049]`}
      >
        <div className={iconStyle}>
          <Image
            src="/product-details/whatsapp.svg"
            alt="Whatsapp"
            width={32}
            height={32}
            className={imgClass}
            priority
            fetchPriority="high"
          />
        </div>
        Whatsapp
      </Link>

      {/* Facebook Messenger */}
      <Link
        prefetch={false}
        href={messengerUrl}
        target="_blank"
        className={`${btnBase} bg-gradient-to-br from-[#00a2ff] to-[#005ce5]`}
      >
        <div className={iconStyle}>
          <Image
            src="/product-details/messenger.svg"
            alt="Messenger"
            width={32}
            height={32}
            className={`${imgClass} brightness-0 invert`}
            priority
            fetchPriority="high"
          />
        </div>
        Messenger
      </Link>

      {/* Share */}
      <div
        onClick={handleShare}
        className={`${btnBase} bg-gradient-to-br from-[#5d697a] to-[#32445c]`}
      >
        <div className={iconStyle}>
          <Image
            src="/product-details/share.svg"
            alt="Share"
            width={32}
            height={32}
            className={imgClass}
          />
        </div>
        Share
      </div>
    </div>
  );
};

export default ShareDetails;
