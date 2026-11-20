"use client";

import { useEffect, useState } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function FlashSaleCountdown({ endAt }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Mark component as hydrated
    setHydrated(true);

    if (!endAt) return;

    // Calculate initial time remaining
    const calculateTimeLeft = () => {
      const endDate = new Date(endAt).getTime();
      const now = new Date().getTime();
      const remaining = Math.max(0, endDate - now);
      setTimeLeft(remaining);
    };

    // Calculate immediately on mount
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const units = [
    { label: "Days", value: pad(days) },
    { label: "Hour", value: pad(hours) },
    { label: "Min", value: pad(minutes) },
    { label: "Sec", value: pad(seconds) },
  ];

  // Show loading state until hydrated and data is available
  if (!hydrated || !endAt) {
    return (
      <div className="flex items-end gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[9px] font-semibold text-gray-700 uppercase tracking-wide mb-0.5">
              {["Days", "Hour", "Min", "Sec"][i]}
            </span>
            <div className="bg-gray-200 text-white font-bold text-sm md:text-base w-8 md:w-9 h-8 md:h-9 flex items-center justify-center rounded-md shadow-md animate-pulse">
              --
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5">
      {units.map(({ label, value }, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-[9px] font-semibold text-gray-700 uppercase tracking-wide mb-0.5">
            {label}
          </span>
          <div className="bg-secondary text-white font-bold text-sm md:text-base w-8 md:w-9 h-8 md:h-9 flex items-center justify-center rounded-md shadow-md">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
