"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm font-light py-5 xl:py-7"
    >
      <ol className="flex items-center space-x-2">
        {/* 1. Home Link */}
        <li>
          <Link
            prefetch={false}
            href="/"
            className={`flex items-center transition-colors hover:text-primary ${pathname === "/" ? "text-black" : "text-gray-500"}`}
          >
            <Home className="w-4 h-4 mr-1" />
            <span>Home</span>
          </Link>
        </li>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = segment.replace(/-/g, " ");

          return (
            <li key={href} className="flex items-center space-x-2">
              <span className="text-gray-400">/</span>

              {/* 2. All items are now Links */}
              <Link
                href={href}
                prefetch={false}
                className={`transition-colors ${label === "iphone" ? "normal-case" : label === "ipad" ? "normal-case" : "capitalize"}  hover:text-primary ${
                  isLast
                    ? "text-black font-normal" // Active page style
                    : "text-gray-500" // Parent page style
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {label === "iphone"
                  ? "iPhone"
                  : label === "ipad"
                    ? "iPad"
                    : label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
