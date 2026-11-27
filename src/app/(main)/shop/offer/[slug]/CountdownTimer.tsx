"use client";

import { useState, useEffect } from "react";
import type { CountdownParts, CountdownTimerProps, TimeUnitProps } from "@/types/props/offer";
import { toDateInput } from "@/lib/json";

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center min-w-[36px]">
      <span className="text-[22px] font-bold text-gray-900 tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({ endAt }: CountdownTimerProps) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // `new Date(endAt) - Date.now()` (Date subtraction uses getTime())
    const getRemaining = () =>
      Math.max(0, Math.floor((new Date(toDateInput(endAt)).getTime() - Date.now()) / 1000));
    setTotal(getRemaining());
    const id = setInterval(() => setTotal((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [endAt]);

  const time: CountdownParts = {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
  };

  return (
    <div className="flex items-center gap-4 border border-gray-400 rounded-xl px-4 py-3 shrink-0 self-start">
      <TimeUnit value={time.days} label="DAY" />
      <span className="text-gray-400 text-lg font-light">|</span>
      <TimeUnit value={time.hours} label="HRS" />
      <span className="text-gray-400 text-lg font-light">|</span>
      <TimeUnit value={time.mins} label="MIN" />
      <span className="text-gray-400 text-lg font-light">|</span>
      <TimeUnit value={time.secs} label="SEC" />
    </div>
  );
}
