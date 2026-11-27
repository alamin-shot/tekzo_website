"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { CompanySettingProps } from "@/types/props/layout";
import { rec, requireString } from "@/lib/json";

const WhatsAppPopUp = ({ companySetting }: CompanySettingProps) => {
  // (showPopup is set but not read — unchanged from the original.)
  const [, setShowPopup] = useState(false);
  // 2 second por popup-ta show hobe
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Clean the phone number: Remove +, -, spaces, and parentheses
  const rawNumber = requireString(rec(companySetting)?.primary_phone_number || "");
  const cleanPhoneNumber = rawNumber.replace(/\D/g, ""); // This removes everything except numbers

  const message = "Hello! I am interested in your products, can you help?";
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-20 right-6 lg:bottom-6 lg:right-6 z-500 flex flex-col items-end gap-3">
      {/* WhatsApp Button with Dheu (Ripple) Effect */}
      <div className="relative flex items-center justify-center">
        {/* Dheu / Ripple Effect Layer */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366]/40 opacity-75 animate-ping"></span>

        {/* Main Icon Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-12 md:w-16 h-12 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 group z-10"
        >
          <Image src="/whatsapp-svgrepo-com.svg" alt="WhatsApp Support" width={34} height={34} className="group-hover:rotate-12 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default WhatsAppPopUp;
