import React from "react";
import {
  CheckCircle2,
  Wrench,
  BatteryCharging,
  ShieldCheck,
  UserCog,
} from "lucide-react";

export default function UsedWarrantyInfo() {
  return (
    <div>
      {/* Warranty Information Section */}
      <div className="bg-white lg:bg-[#E7E9EB] rounded-xl lg:rounded-[20px] p-4 2xl:p-6 ">
        <h2 className="text-base 2xl:text-lg font-bold text-gray-800 mb-4">
          Warranty Information
        </h2>

        <div className="space-y-2">
          {/* 15-Day Replacement Warranty */}
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 lg:w-6 lg:h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-xs lg:text-sm 2xl:text-lg text-gray-900 font-semibold leading-relaxed">
                15-Day Replacement Warranty:{" "}
                <span className="font-normal text-gray-700">
                  Covers Camera, Motherboard, and Battery
                </span>
              </p>
            </div>
          </div>

          {/* 1-Year Service Warranty */}
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <UserCog className="w-4 h-4 lg:w-6 lg:h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-xs lg:text-sm 2xl:text-lg text-gray-900 font-semibold">
                1-Year Service Warranty
              </p>
            </div>
          </div>

          {/* 30-Day Battery Health Warranty */}
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <BatteryCharging className="w-4 h-4 lg:w-6 lg:h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-xs lg:text-sm 2xl:text-lg text-gray-900 font-semibold leading-relaxed">
                30-Day Battery Health Warranty:{" "}
                <span className="font-normal text-gray-700">
                  For up to 5% degradation
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
