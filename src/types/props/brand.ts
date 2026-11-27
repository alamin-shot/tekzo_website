// Props for the brand listing / brand page components (P5c-2). API payloads
// stay `unknown` and are read through src/lib/json.ts.

export type BrandDescriptionProps = {
  description?: unknown;
  title?: string;
};

/** BrandProducts / SingleBrand: the raw product list. */
export type BrandProductsProps = {
  products: unknown;
};

/** BrandsWithFilter: the raw /all-brands list and its CMS seoData. */
export type BrandsWithFilterProps = {
  initialBrands: unknown;
  seoData?: unknown;
};
