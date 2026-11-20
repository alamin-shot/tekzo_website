import Image from "next/image";
import Link from "next/link";
import React from "react";

const ItemMerge = ({ item, name }) => {
  return (
    <>
      {name === "brand" && (
        <Link prefetch={false} href={`/brands/${item?.slug?.toLowerCase()}`} className="flex flex-col items-center group  ">
          {item?.primary_logo ? (
            <div className="w-35 h-30 flex items-center justify-start">
              <Image src={item?.primary_logo || "/placeholder.jpg"} alt={item.name} width={120} height={120} title={item.name} className="group-hover:scale-105 transition-transform duration-200" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded" /> // fallback placeholder
          )}
        </Link>
      )}
      {name === "categories" && (
        <Link prefetch={false} href={`/categories/${item?.slug?.toLowerCase()}`} className="flex flex-col items-center group">
          {item?.logo ? (
            <Image src={item?.logo || "/placeholder.jpg"} alt={item.name || "Category"} width={70} height={70} className="w-15 h-15 group-hover:scale-105 transition-transform duration-200" />
          ) : (
            <div className="w-15 h-15 bg-gray-100 rounded" /> // fallback placeholder
          )}
          <span className="mt-2 text-sm group-hover:scale-105 transition-transform duration-200">{item.name}</span>
        </Link>
      )}
    </>
  );
};

export default ItemMerge;
