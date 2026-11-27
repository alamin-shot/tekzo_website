// SEO / metadata shapes produced by lib/seo and utils/buildMetadata.

/** /api/revalidate "page-seo": CMS SEO page slug → site path to revalidate. */
export type SeoPathMap = Record<string, string>;

/** OpenGraph / Twitter image entry built by buildMetadata. */
export type MetadataImage = {
  url: unknown;
  width: 1200;
  height: 630;
  alt: unknown;
};

/**
 * buildMetadata() output. Field values come straight from the CMS `seoData`
 * object (unvalidated), so text fields are `unknown`; the shape matches what
 * Next.js reads from `metadata`.
 */
export type BuiltMetadata = {
  title: unknown;
  description: unknown;
  keywords: string[];
  alternates: { canonical: string };
  openGraph: {
    title: unknown;
    description: unknown;
    url: string;
    siteName: unknown;
    type: "website";
    images: MetadataImage[];
  };
  twitter: {
    card: "summary_large_image";
    title: unknown;
    description: unknown;
    images: MetadataImage[];
  };
  robots: {
    index: true;
    follow: true;
    googleBot: {
      index: true;
      follow: true;
      "max-image-preview": "large";
      "max-snippet": -1;
    };
  };
};

/** One quick-answer Q&A pair (lib/seo/quickAnswers). */
export type QuickAnswerItem = {
  q: string;
  a: string;
};

/** Attributed quote shown under quick answers. */
export type QuickAnswerQuote = {
  text: string;
  author: unknown;
  context: string;
};

/** Outbound "source" citation. */
export type QuickAnswerSource = {
  label: string;
  url: string;
};

export type QuickAnswers = {
  title: string;
  items: QuickAnswerItem[];
  quote: QuickAnswerQuote | null;
  sources: QuickAnswerSource[];
  path: unknown;
};

/** buildListingAnswers() input. */
export type ListingAnswersInput = {
  kind: unknown;
  entity: unknown;
  products: unknown;
  total: unknown;
  brand: unknown;
  tagline: unknown;
  path: unknown;
};

/** Ranked brand signals for category pages. */
export type ListedBrandSignals = {
  quote: QuickAnswerQuote | null;
  sources: QuickAnswerSource[];
};
