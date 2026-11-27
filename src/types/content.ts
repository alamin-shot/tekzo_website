// CMS / content shapes produced on the frontend.

/** getHomeCustomerQuote() result for the homepage FAQ. */
export type HomeCustomerQuote = {
  text: string;
  author: unknown;
  rating: unknown;
  productName: unknown;
  productSlug: unknown;
};

/** getFaqs() result. */
export type FaqsResult = {
  faqs: unknown[];
  seoData: unknown;
};

/** A /blog-tags post mapped for PostCard (tags/[slug] `toPost`); values are raw API fields. */
export type TagPost = {
  slug: unknown;
  title: unknown;
  excerpt: unknown;
  image: unknown;
  category: unknown;
  author: unknown;
  date: unknown;
};

/** BlogContent `toAllPost`: a TagPost plus the reading time. */
export type BlogListPost = TagPost & {
  readingTime: unknown;
};

/** getOutlets() result. */
export type OutletsResult = {
  outlets: unknown;
  seoData: unknown;
};
