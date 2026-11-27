import React from "react";
import Link from "next/link";
import type { ProductCrumb, UsedBreadcrumbsProps } from "@/types/props/product";
import { rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

export default function Breadcrumbs({ product }: UsedBreadcrumbsProps) {
  const brand = rec(product)?.brand;
  const category = rec(product)?.category;

  // `cond && {...}` entries dropped by `.filter(Boolean)` = conditional spreads
  const breadcrumbs: ProductCrumb[] = [
    { label: "Home", href: "/" },
    ...(brand ? [{
      label: rec(brand)?.name,
      href: `/brands/${String(rec(brand)?.slug)}`,
    }] : []),
    ...(category ? [{
      label: rec(category)?.name,
      href: `/categories/${String(rec(category)?.slug)}`,
    }] : []),
    {
      label: rec(product)?.product_name,
      href: null,
    },
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm font-light py-5 xl:py-7"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={index} className="flex items-center space-x-2">
              {index !== 0 && <span className="text-gray-400">/</span>}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {nodeOf(item.label)}
                </Link>
              ) : (
                <span className="text-black font-normal">{nodeOf(item.label)}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
