// Product shapes derived on the frontend. Raw backend product payloads stay
// `unknown` until the consuming components are converted (P5–P7).

/** One gallery slide built by utils/variantImages.buildVariantSlides(). */
export type VariantSlide = {
  id: unknown;
  src: string;
  alt: unknown;
};

/** Options for buildVariantSlides(). */
export type VariantSlideFallback = {
  fallbackSrc?: unknown;
  fallbackAlt?: unknown;
};

/** Search UI product, mapped by lib/search/mapSearchProduct from raw rows. */
export type SearchProduct = {
  id: unknown;
  slug: string;
  name: string;
  image: string;
  price: number | null;
  regularPrice: number | null;
  discount: number | null;
  badges: {
    official: boolean;
    unofficial: boolean;
    chinese: boolean;
    refurbished: boolean;
  };
  inStock: boolean | null;
};
