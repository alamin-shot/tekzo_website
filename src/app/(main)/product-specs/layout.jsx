// Placeholder page that renders the product template without a product —
// keep it out of search results.
export const metadata = {
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function ProductSpecsLayout({ children }) {
  return children;
}
