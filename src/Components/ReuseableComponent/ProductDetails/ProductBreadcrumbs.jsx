import React from "react";
import Link from "next/link";

export default function Breadcrumbs({ product, from }) {
  const categoryArray = product?.breadcrumbs || [];

  const breadcrumbs = [
    { label: "Home", href: "/" },

    ...(Array.isArray(categoryArray) ? categoryArray : []).map((cat) => ({
      label: cat?.name,
      href: `/categories/${cat?.slug}`,
    })),

    {
      label: product?.product_name,
      href: null,
    },
  ].filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className={`block w-full text-[11px] md:text-sm font-light ${from === "productDetails" ? "py-0 xl:py-0" : "py-5 xl:py-7"}`}
    >
      <div className="block w-full break-words leading-relaxed text-gray-500">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <span key={index} className="inline min-w-0">
              {index !== 0 && (
                <span className="text-gray-400 mx-1 md:mx-2 inline-block">
                  /
                </span>
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  prefetch={false}
                  className="text-gray-500 hover:text-primary transition-colors inline-block whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-black font-normal inline">
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
