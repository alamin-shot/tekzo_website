// Developer test page — keep out of search results, but let crawlers follow links.
// Applies to every page under this folder.
export const metadata = {
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function TestLayout({ children }) {
  return children;
}
