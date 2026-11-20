"use client";

import { useState, useEffect } from "react";

export default function ViewersCount() {
  const [viewers, setViewers] = useState(() => {
    return Math.floor(Math.random() * (200 - 100 + 1)) + 100;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newViewers = prev + change;

        if (newViewers < 100) return 102;
        if (newViewers > 200) return 198;

        return newViewers;
      });
    }, 40000);

    return () => clearInterval(interval);
  }, []);

  return <span className="text-[10px] lg:text-xs font-semibold text-gray-700">{viewers.toLocaleString()} peoples are viewing this product</span>;
}
