"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Phone } from "lucide-react";
import { getSettings } from "@/lib/api";

export default function OrderReassurance({ supportPhone: propSupportPhone }) {
  const [companySetting, setCompanySetting] = useState(() => {
    if (typeof window !== "undefined" && window.__COMPANY_SETTING__) {
      return window.__COMPANY_SETTING__;
    }
    return null;
  });

  useEffect(() => {
    if (!propSupportPhone && !companySetting) {
      getSettings()
        .then((data) => {
          if (data) setCompanySetting(data);
        })
        .catch((err) => console.error("Error loading company settings:", err));
    }
  }, [propSupportPhone, companySetting]);

  const phone =
    propSupportPhone ||
    companySetting?.primary_phone_number ||
    companySetting?.phone ||
    companySetting?.secondary_phone_number ||
    "+8801897-715222";

  const cleanPhone = phone ? phone.replace(/[^0-9+]/g, "") : "";

  return (
    <div className="flex items-start sm:items-center gap-3 lg:gap-4 mb-4 lg:mb-6 px-4 lg:px-0">
      {/* Icon Badge */}
      <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center">
        <Smartphone className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
      </div>

      {/* Text Content & Phone Button */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <p className="text-xs lg:text-sm 2xl:text-base text-gray-900">
          <span className="font-semibold">নিশ্চিন্তে অর্ডার করুন: </span>
          <span className="font-normal text-gray-700">
            কোনো কিছু নিয়ে কনফিউশন থাকলে ফোন কলের মাধ্যমে সমাধান করে দেওয়া হবে।
          </span>
        </p>
        {phone && (
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-white font-semibold text-xs rounded-lg shadow-xs hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Phone size={12} />
            <span>{phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
