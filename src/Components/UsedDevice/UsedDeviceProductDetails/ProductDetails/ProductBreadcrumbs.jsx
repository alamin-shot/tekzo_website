import React from "react";
import Link from "next/link";

export default function Breadcrumbs({ product }) {
  const brand = product?.brand;
  const category = product?.category;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    brand && {
      label: brand.name,
      href: `/brands/${brand.slug}`,
    },
    category && {
      label: category.name,
      href: `/categories/${category.slug}`,
    },
    {
      label: product?.product_name,
      href: null,
    },
  ].filter(Boolean);

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
                  {item.label}
                </Link>
              ) : (
                <span className="text-black font-normal">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
