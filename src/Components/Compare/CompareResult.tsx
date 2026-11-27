"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Title2 from "../ReuseableComponent/Title2";
import { X } from "lucide-react";
import type { CompareGroupedSpec, CompareOverviewField, CompareProductCardProps, CompareResultProps, CompareRowProps, CompareSectionBlockProps, CompareSpecSection, CompareSpecSide } from "@/types/props/checkout";
import { fieldsOf, findIndexList, isList, itemAt, itemOpt, rec } from "@/lib/json";
import { keyFrom, nodeOf, str } from "@/lib/render";

// `list?.some(fn)` for an API value (a non-list throws, as before)
const someOpt = (list: unknown, fn: (item: unknown) => unknown): boolean | undefined =>
  list === null || list === undefined ? undefined : findIndexList(list, fn) !== -1;

/* ─── price helper ────────────────────────────────────────────────────────── */

const fmt = (amount: unknown) => {
  if (amount === undefined || amount === null || amount === "") return "—";
  if (typeof amount === "number") return `৳ ${amount.toLocaleString()}`;
  if (!Number.isNaN(Number(amount)))
    return `৳ ${Number(amount).toLocaleString()}`;
  return "—";
};

/* ─── safe image src ──────────────────────────────────────────────────────── */

const safeImg = (src: unknown) =>
  typeof src === "string" && src.startsWith("http") ? src : "/placeholder.jpg";

/* ─── build merged spec groups ────────────────────────────────────────────── */

const buildGroupedSpecs = (p1: unknown, p2: unknown): CompareGroupedSpec[] => {
  const sectionMap = new Map<unknown, CompareSpecSection>();

  const add = (product: unknown, side: CompareSpecSide) => {
    const specifications = rec(product)?.specifications;
    if (!isList(specifications)) return;
    specifications.forEach((section) => {
      const sec = fieldsOf(section);
      const sName = sec.name || "General";
      if (!sectionMap.has(sName))
        sectionMap.set(sName, {
          id: sec.id,
          name: sName,
          specMap: new Map(),
        });
      const entry = sectionMap.get(sName);
      if (!entry) return;
      const groupValues = sec.group_values || [];
      if (!isList(groupValues)) throw new TypeError("(section.group_values || []).forEach is not a function");
      groupValues.forEach((item) => {
        const it = fieldsOf(item);
        const key = it.name || "Detail";
        if (!entry.specMap.has(key))
          entry.specMap.set(key, {
            id: it.id,
            name: key,
            left: "—",
            right: "—",
          });
        const val = it.details || it.value || it.description || "—";
        const row = entry.specMap.get(key);
        if (row) row[side] = val || "—";
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

const OVERVIEW_FIELDS: CompareOverviewField[] = [
  { label: "Brand", get: (p) => rec(rec(p)?.brand)?.name || rec(p)?.brand_name || "—" },
  {
    label: "Category",
    get: (p) => rec(rec(p)?.category)?.name || rec(p)?.category_name || "—",
  },
  { label: "Warranty", get: (p) => rec(p)?.warranty_text || "—" },
  {
    label: "Status",
    get: (p) => {
      if (rec(p)?.product_quantity !== undefined)
        return Number(fieldsOf(p).product_quantity) > 0 ? "In Stock" : "Out of Stock";
      const hasStock = someOpt(rec(p)?.variants,
        (v) => fieldsOf(v).stock === true || fieldsOf(v).stock === 1,
      );
      return hasStock ? "In Stock" : "Out of Stock";
    },
  },
];

/* ─── row component ───────────────────────────────────────────────────────── */

const Row = ({ label, left, right }: CompareRowProps) => (
  <tr className="border-b border-gray-100 last:border-0">
    <td className="py-3 pr-6 text-xs font-semibold text-gray-400 align-top uppercase tracking-wider whitespace-nowrap w-[30%] hidden md:block">
      {nodeOf(label)}
    </td>
    <td className="py-3 pr-6 text-xs lg:text-sm text-gray-700 align-top leading-relaxed w-[35%]">
      {nodeOf(left || "—")}
    </td>
    <td className="py-3 text-xs lg:text-sm text-gray-700 align-top leading-relaxed w-[35%]">
      {nodeOf(right || "—")}
    </td>
  </tr>
);

/* ─── section block ───────────────────────────────────────────────────────── */

const SectionBlock = ({ title, p1Name, p2Name, children }: CompareSectionBlockProps) => (
  <div className="rounded-2xl overflow-hidden border border-gray-100">
    {/* title bar */}
    <div className="bg-[#fbfbfb] border-b-2 lg:border-b-3 border-dark  px-5 py-3.5 flex items-center *:w-[50%] md:*:w-[35%]">
      <span className="font-semibold text-sm lg:text-base text-gray-700 flex-1 hidden md:block">
        {nodeOf(title)}
      </span>
      {nodeOf(p1Name && (
        <>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-[35%] truncate">
            {nodeOf(p1Name)}
          </span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-[35%] truncate">
            {nodeOf(p2Name)}
          </span>
        </>
      ))}
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

const ProductCard = ({ product, index, onRemove }: CompareProductCardProps) => {
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400 min-h-64">
        <p className="font-semibold text-gray-500 mb-1">Empty slot</p>
        <p className="text-xs">Select a product above</p>
      </div>
    );
  }

  const inStock =
    rec(product)?.product_quantity !== undefined
      ? Number(fieldsOf(product).product_quantity) > 0
      : (someOpt(rec(product)?.variants, (v) => fieldsOf(v).stock === true || fieldsOf(v).stock === 1) ??
        true);

  // best image: first from images array (S3), fallback product_image
  const imgSrc =
    safeImg(rec(itemOpt(rec(product)?.images, 0))?.image_path) !== "/placeholder.jpg"
      ? safeImg(fieldsOf(itemAt(fieldsOf(product).images, 0)).image_path)
      : safeImg(rec(product)?.product_image);

  const brandLogo = rec(rec(product)?.brand)?.primary_logo;
  const brandName = rec(rec(product)?.brand)?.name || rec(product)?.brand_name;

  return (
    <div className="relative bg-white flex flex-col  my-rounded border border-gray-100 overflow-hidden">
      {/* image */}
      <div className="relative w-full  aspect-square border-b-2 lg:border-b-3 border-dark ">
        <Image
          src={imgSrc}
          alt={str(rec(product)?.product_name || "Product") ?? ""}
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
          href={`/product/${String(rec(product)?.slug || "")}`}
          className="text-sm md:text-base font-semibold text-gray-900 leading-snug hover:text-secondary transition-colors line-clamp-2"
        >
          {nodeOf(rec(product)?.product_name || rec(product)?.name)}
        </Link>

        {/* brand logo + name */}
        <div className="flex items-center gap-2 ">
          {nodeOf(brandLogo && (
            <Image
              src={safeImg(brandLogo)}
              alt={str(brandName || "brand") ?? ""}
              width={48}
              height={24}
              sizes="48px"
              className="h-5 w-auto object-contain"
            />
          ))}
          {nodeOf(brandName && !brandLogo && (
            <span className="text-xs text-gray-500">{nodeOf(brandName)}</span>
          ))}
        </div>

        {/* meta row */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-auto">
          {nodeOf(rec(rec(product)?.category)?.name && (
            <div>
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Category
              </span>
              <span className="text-gray-700">{nodeOf(fieldsOf(fieldsOf(product).category).name)}</span>
            </div>
          ))}
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

export default function CompareResult({ products = [], onRemove = () => {} }: CompareResultProps) {
  const productList = [products[0] || null, products[1] || null];
  const selectedCount = productList.filter(Boolean).length;
  const groupedSpecs = buildGroupedSpecs(productList[0], productList[1]);
  const hasSpecs = groupedSpecs.length > 0;

  const p1Name =
    rec(productList[0])?.product_name || rec(productList[0])?.name || "Product 1";
  const p2Name =
    rec(productList[1])?.product_name || rec(productList[1])?.name || "Product 2";

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
                  key={keyFrom(section.id ?? section.name)}
                  title={section.name}
                  p1Name={p1Name}
                  p2Name={p2Name}
                >
                  {section.rows.map((item, i) => (
                    <Row
                      key={`${String(section.id)}-${String(item.id || i)}`}
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
