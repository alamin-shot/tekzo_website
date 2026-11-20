"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Title2 from "../ReuseableComponent/Title2";
import { X } from "lucide-react";

/* ─── price helper ────────────────────────────────────────────────────────── */

const fmt = (amount) => {
  if (amount === undefined || amount === null || amount === "") return "—";
  if (typeof amount === "number") return `৳ ${amount.toLocaleString()}`;
  if (!Number.isNaN(Number(amount)))
    return `৳ ${Number(amount).toLocaleString()}`;
  return "—";
};

/* ─── safe image src ──────────────────────────────────────────────────────── */

const safeImg = (src) =>
  typeof src === "string" && src.startsWith("http") ? src : "/placeholder.jpg";

/* ─── build merged spec groups ────────────────────────────────────────────── */

const buildGroupedSpecs = (p1, p2) => {
  const sectionMap = new Map();

  const add = (product, side) => {
    if (!Array.isArray(product?.specifications)) return;
    product.specifications.forEach((section) => {
      const sName = section.name || "General";
      if (!sectionMap.has(sName))
        sectionMap.set(sName, {
          id: section.id,
          name: sName,
          specMap: new Map(),
        });
      const entry = sectionMap.get(sName);
      (section.group_values || []).forEach((item) => {
        const key = item.name || "Detail";
        if (!entry.specMap.has(key))
          entry.specMap.set(key, {
            id: item.id,
            name: key,
            left: "—",
            right: "—",
          });
        const val = item.details || item.value || item.description || "—";
        entry.specMap.get(key)[side] = val || "—";
      });
    });
  };

  add(p1, "left");
  add(p2, "right");

  return Array.from(sectionMap.values()).map((s) => ({
    id: s.id,
    name: s.name,
    rows: Array.from(s.specMap.values()),
  }));
};

/* ─── overview field definitions (from ProductDetails API) ───────────────── */

const OVERVIEW_FIELDS = [
  { label: "Brand", get: (p) => p?.brand?.name || p?.brand_name || "—" },
  {
    label: "Category",
    get: (p) => p?.category?.name || p?.category_name || "—",
  },
  { label: "Warranty", get: (p) => p?.warranty_text || "—" },
  {
    label: "Status",
    get: (p) => {
      if (p?.product_quantity !== undefined)
        return p.product_quantity > 0 ? "In Stock" : "Out of Stock";
      const hasStock = p?.variants?.some(
        (v) => v.stock === true || v.stock === 1,
      );
      return hasStock ? "In Stock" : "Out of Stock";
    },
  },
];

/* ─── row component ───────────────────────────────────────────────────────── */

const Row = ({ label, left, right }) => (
  <tr className="border-b border-gray-100 last:border-0">
    <td className="py-3 pr-6 text-xs font-semibold text-gray-400 align-top uppercase tracking-wider whitespace-nowrap w-[30%] hidden md:block">
      {label}
    </td>
    <td className="py-3 pr-6 text-xs lg:text-sm text-gray-700 align-top leading-relaxed w-[35%]">
      {left || "—"}
    </td>
    <td className="py-3 text-xs lg:text-sm text-gray-700 align-top leading-relaxed w-[35%]">
      {right || "—"}
    </td>
  </tr>
);

/* ─── section block ───────────────────────────────────────────────────────── */

const SectionBlock = ({ title, p1Name, p2Name, children }) => (
  <div className="rounded-2xl overflow-hidden border border-gray-100">
    {/* title bar */}
    <div className="bg-[#fbfbfb] border-b-2 lg:border-b-3 border-dark  px-5 py-3.5 flex items-center *:w-[50%] md:*:w-[35%]">
      <span className="font-semibold text-sm lg:text-base text-gray-700 flex-1 hidden md:block">
        {title}
      </span>
      {p1Name && (
        <>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-[35%] truncate">
            {p1Name}
          </span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-[35%] truncate">
            {p2Name}
          </span>
        </>
      )}
    </div>
    {/* rows */}
    <div className="px-5 bg-white">
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </div>
  </div>
);

/* ─── product card ────────────────────────────────────────────────────────── */

const ProductCard = ({ product, index, onRemove }) => {
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400 min-h-64">
        <p className="font-semibold text-gray-500 mb-1">Empty slot</p>
        <p className="text-xs">Select a product above</p>
      </div>
    );
  }

  const inStock =
    product?.product_quantity !== undefined
      ? product.product_quantity > 0
      : (product?.variants?.some((v) => v.stock === true || v.stock === 1) ??
        true);

  // best image: first from images array (S3), fallback product_image
  const imgSrc =
    safeImg(product?.images?.[0]?.image_path) !== "/placeholder.jpg"
      ? safeImg(product.images[0].image_path)
      : safeImg(product?.product_image);

  const brandLogo = product?.brand?.primary_logo;
  const brandName = product?.brand?.name || product?.brand_name;

  return (
    <div className="relative bg-white flex flex-col  my-rounded border border-gray-100 overflow-hidden">
      {/* image */}
      <div className="relative w-full  aspect-square border-b-2 lg:border-b-3 border-dark ">
        <Image
          src={imgSrc}
          alt={product?.product_name || "Product"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6 lg:p-20 "
        />
      </div>
      <div
        className="absolute right-1 top-1 lg:right-4 lg:top-4 bg-gray-200 rounded-full p-1 cursor-pointer"
        onClick={() => onRemove(index)}
      >
        <X className="text-gray-600 w-4 h-4 lg:w-6 lg:h-6"></X>
      </div>

      {/* info */}
      <div className="p-3 lg:p-4 2xl:p-5 flex flex-col gap-3 flex-1 ">
        {/* name */}
        <Link
          href={`/product/${product?.slug || ""}`}
          className="text-sm md:text-base font-semibold text-gray-900 leading-snug hover:text-secondary transition-colors line-clamp-2"
        >
          {product?.product_name || product?.name}
        </Link>

        {/* brand logo + name */}
        <div className="flex items-center gap-2 ">
          {brandLogo && (
            <Image
              src={safeImg(brandLogo)}
              alt={brandName || "brand"}
              width={48}
              height={24}
              sizes="48px"
              className="h-5 w-auto object-contain"
            />
          )}
          {brandName && !brandLogo && (
            <span className="text-xs text-gray-500">{brandName}</span>
          )}
        </div>

        {/* meta row */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-auto">
          {product?.category?.name && (
            <div>
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Category
              </span>
              <span className="text-gray-700">{product.category.name}</span>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inStock ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── main ────────────────────────────────────────────────────────────────── */

export default function CompareResult({ products = [], onRemove = () => {} }) {
  const productList = [products[0] || null, products[1] || null];
  const selectedCount = productList.filter(Boolean).length;
  const groupedSpecs = buildGroupedSpecs(productList[0], productList[1]);
  const hasSpecs = groupedSpecs.length > 0;

  const p1Name =
    productList[0]?.product_name || productList[0]?.name || "Product 1";
  const p2Name =
    productList[1]?.product_name || productList[1]?.name || "Product 2";

  return (
    <div className="lg:bg-dark min-h-screen my-rounded my-mt pb-6 lg:pb-10">
      <main id="compare-result" className="max-w-7xl mx-auto pt-6 md:pt-10 ">
        <Title2>Product Comparison</Title2>

        {/* placeholder */}
        {selectedCount < 2 && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-400 text-sm">
            {selectedCount === 0
              ? "Search and select two products to compare head-to-head."
              : "One product selected — search for the second product to start comparing."}
          </div>
        )}

        {/* product cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5 ">
          {productList.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              index={index}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* comparison tables */}
        {selectedCount > 0 && (
          <div className="mt-6 space-y-3 ">
            {/* overview */}
            <SectionBlock title="Overview" p1Name={p1Name} p2Name={p2Name}>
              {OVERVIEW_FIELDS.map(({ label, get }) => (
                <Row
                  key={label}
                  label={label}
                  left={get(productList[0])}
                  right={get(productList[1])}
                />
              ))}
            </SectionBlock>

            {/* spec sections */}
            {hasSpecs &&
              groupedSpecs.map((section) => (
                <SectionBlock
                  key={section.id ?? section.name}
                  title={section.name}
                  p1Name={p1Name}
                  p2Name={p2Name}
                >
                  {section.rows.map((item, i) => (
                    <Row
                      key={`${section.id}-${item.id || i}`}
                      label={item.name}
                      left={item.left}
                      right={item.right}
                    />
                  ))}
                </SectionBlock>
              ))}

            {selectedCount === 2 && !hasSpecs && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400">
                No specification data available for the selected products.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
