"use client";

import Image from "next/image";
import { useState } from "react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/search/resolveProductImage";

// next/image that falls back to the placeholder if the source fails to load
// (deleted file, broken CDN object). Remembers which src failed so a new
// product in the same slot gets a fresh attempt.
export default function SafeProductImage({ src, alt, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const current = failedSrc === src ? PRODUCT_IMAGE_PLACEHOLDER : src;

  return <Image {...props} src={current} alt={alt ?? ""} onError={() => setFailedSrc(src)} />;
}
