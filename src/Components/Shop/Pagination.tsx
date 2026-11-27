"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ShopPaginationProps } from "@/types/props/shop";
import { rec } from "@/lib/json";
import { keyFrom, nodeOf } from "@/lib/render";

export default function Pagination({ shopProducts, currentPage }: ShopPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pagination = rec(shopProducts)?.pagination;

  if (!pagination) return null;

  // Raw API value: pushed and compared (`===`) as-is below; `<=`, `<` and
  // `-` convert it to a number, as `Number()` does.
  const totalPages = rec(pagination)?.last_page;
  const total = Number(totalPages);

  // Nothing to paginate to — showing a lone, clickable "1" here was
  // confusing when every product already fit on a single page.
  if (total <= 1) return null;

  const buildPageUrl = (page: unknown) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: unknown[] = [];
    const maxVisiblePages = 5;

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(total - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < total - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-10 lg:pt-15">
      {/* Previous Button */}
      {currentPage === 1 ? (
        <span
          aria-hidden="true"
          className="w-10 h-10 flex items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-300 opacity-30 cursor-not-allowed"
        >
          <ChevronLeft size={15} strokeWidth={2} />
        </span>
      ) : (
        <Link
          prefetch={false}
          href={buildPageUrl(currentPage - 1)}
          aria-label="Previous page"
          className="w-10 h-10 flex items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-all"
        >
          <ChevronLeft size={15} strokeWidth={2} />
        </Link>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="w-8 h-10 flex items-center justify-center text-gray-300 text-sm tracking-widest"
            >
              ···
            </span>
          ) : (
            <Link
              key={keyFrom(page)}
              prefetch={false}
              href={buildPageUrl(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-[10px] text-sm font-medium transition-all
              ${
                currentPage === page
                  ? "bg-secondary  text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {nodeOf(page)}
            </Link>
          ),
        )}
      </div>

      {/* Next Button */}
      {currentPage === totalPages ? (
        <span
          aria-hidden="true"
          className="w-10 h-10 flex items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-300 opacity-30 cursor-not-allowed"
        >
          <ChevronRight size={15} strokeWidth={2} />
        </span>
      ) : (
        <Link
          prefetch={false}
          href={buildPageUrl(currentPage + 1)}
          aria-label="Next page"
          className="w-10 h-10 flex items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-all"
        >
          <ChevronRight size={15} strokeWidth={2} />
        </Link>
      )}
    </nav>
  );
}
