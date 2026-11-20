"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import Image from "next/image";

const Coupon = ({ productDetails }) => {
  const [copied, setCopied] = useState(false);
  const couponData = productDetails?.coupon;
  const couponCode = couponData?.code;

  if (!couponCode) {
    return null;
  }

  const handleCopy = async () => {
    // 1. Try the modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(couponCode);
        triggerSuccess();
        return;
      } catch (err) {
        console.warn("Modern clipboard API failed, trying fallback...", err);
      }
    }

    // 2. Fallback method for mobile browsers / non-HTTPS environments
    const textArea = document.createElement("textarea");
    textArea.value = couponCode;

    // Position out of view but keep it selectable
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        triggerSuccess();
      } else {
        console.error("Fallback copy command failed");
      }
    } catch (err) {
      console.error("Fallback execution failed", err);
    }

    document.body.removeChild(textArea);
  };

  const triggerSuccess = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative bg-gray-200 p-1.5 rounded-xl lg:rounded-2xl 2xl:rounded-[20px]">
      <Image
        src="/gift.svg"
        alt="svg"
        width={300}
        height={100}
        className="w-full"
      />

      <div className="absolute top-1/2 transform -translate-y-1/2 w-[23%] flex justify-center items-center">
        <p className="text-[11px] lg:text-sm 2xl:text-base whitespace-nowrap pl-1 font-semibold text-gray-800">
          Coupon
        </p>
      </div>

      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[77%]">
        {couponData ? (
          <div className="flex items-center gap-2 lg:gap-4 pl-8 lg:pl-14 text-sm lg:text-sm 2xl:text-lg">
            <div>
              <span className="font-semibold mr-1 text-gray-800">Code:</span>{" "}
              <span className="">{couponCode}</span>
              <span className="block text-gray-500 text-xs mt-0.5">
                Save:{couponData?.amount || 0}৳
              </span>
            </div>

            <button
              onClick={handleCopy}
              className={`flex gap-1 items-center text-xs px-2 py-0.5 lg:py-1 rounded-sm transition-colors duration-200 ${
                copied
                  ? "bg-secondary text-white"
                  : "bg-primary text-white hover:bg-primary/90 active:scale-95"
              }`}
            >
              {copied ? (
                <>
                  Copied! <Check className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Copy <Copy className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 lg:gap-4 pl-8 lg:pl-14 text-xs lg:text-sm 2xl:text-base">
            <span className=" mr-1 text-gray-500">
              This code is no longer active.
            </span>{" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupon;
