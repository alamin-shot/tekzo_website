// Next.js 16 route-segment props. Both arrive as Promises.
//
// `searchParams` values are `unknown`: Next passes string | string[] |
// undefined, and pages read them with `?.` and pass them on as-is, so the
// wider type keeps every existing read valid without narrowing.

export type SegmentParams = Record<string, string>;

export type SearchParamsRecord = Record<string, unknown>;

/** Page / generateMetadata props with a dynamic segment (e.g. `[slug]`). */
export type SlugPageProps = {
  params: Promise<SegmentParams>;
  searchParams: Promise<SearchParamsRecord>;
};

/** Page / generateMetadata props for routes without dynamic segments. */
export type SearchPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

/** generateMetadata / opengraph-image props for a `[slug]` route without search params. */
export type ParamsOnlyProps = {
  params: Promise<SegmentParams>;
};
