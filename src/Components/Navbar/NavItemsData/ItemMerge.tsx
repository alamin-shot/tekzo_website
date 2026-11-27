import Image from "next/image";
import Link from "next/link";
import React from "react";
import type { ItemMergeProps } from "@/types/props/layout";
import { fieldsOf, lowerOpt, rec } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";

const ItemMerge = ({ item, name }: ItemMergeProps) => {
  const it = rec(item);
  return (
    <>
      {name === "brand" && (
        <Link prefetch={false} href={`/brands/${lowerOpt(it?.slug)}`} className="flex flex-col items-center group  ">
          {it?.primary_logo ? (
            <div className="w-35 h-30 flex items-center justify-start">
              <Image src={str(it.primary_logo) || "/placeholder.jpg"} alt={str(it.name) ?? ""} width={120} height={120} title={str(it.name)} className="group-hover:scale-105 transition-transform duration-200" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded" /> // fallback placeholder
          )}
        </Link>
      )}
      {name === "categories" && (
        <Link prefetch={false} href={`/categories/${lowerOpt(it?.slug)}`} className="flex flex-col items-center group">
          {it?.logo ? (
            <Image src={str(it.logo) || "/placeholder.jpg"} alt={str(it.name || "Category") ?? ""} width={70} height={70} className="w-15 h-15 group-hover:scale-105 transition-transform duration-200" />
          ) : (
            <div className="w-15 h-15 bg-gray-100 rounded" /> // fallback placeholder
          )}
          {/* `item.name` threw for a null item here; fieldsOf keeps that. */}
          <span className="mt-2 text-sm group-hover:scale-105 transition-transform duration-200">{nodeOf(fieldsOf(item).name)}</span>
        </Link>
      )}
    </>
  );
};

export default ItemMerge;
