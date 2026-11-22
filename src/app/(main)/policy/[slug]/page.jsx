import Banner from "@/Components/ReuseableComponent/Banner";
import { getPolicies, getPolicyBySlug } from "@/lib/api";
import { formatHtml } from "@/lib/formatHtml";

export const revalidate = 3600;

export async function generateStaticParams() {
  const policies = await getPolicies();
  return policies.map((policy) => ({ slug: policy.type }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getPolicyBySlug(slug);
  const seo = data?.seoData;

  const title = seo?.title ?? "";
  const description = seo?.description ?? "";
  const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [];
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = seo?.canonical || `${baseUrl}/policy/${slug}`;
  const ogImage = seo?.ogImage || "/loginPage/contact-about-bg.webp";
  const siteName = seo?.siteName;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "content-signal": "search=yes,ai-train=no",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const Policy = async ({ params }) => {
  const { slug } = await params;
  const privacyText = await getPolicyBySlug(slug);

  if (!privacyText) {
    return (
      <div className="container pt-7 lg:pt-15 text-gray-700">
        <p>Content not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Banner h1
        image={
          privacyText?.seoData?.banner || "/loginPage/contact-about-bg.webp"
        }
        title={privacyText.name ?? slug}
      />
      {privacyText.value && (
        <div className="container pt-7 lg:pt-15">
          <div
            className="
              prose max-w-none
              overflow-x-auto
              break-words
              [&_*]:max-w-full
              [&_img]:h-auto
              [&_img]:max-w-full
              [&_iframe]:max-w-full
              [&_pre]:overflow-x-auto
              [&_table]:w-max
              [&_table]:mt-4
              [&_table]:min-w-full
              [&_table]:border-collapse
              [&_table]:block
              [&_table]:overflow-x-auto
              [&_td]:whitespace-nowrap
              [&_th]:whitespace-nowrap
              rendered-html
              "
            dangerouslySetInnerHTML={{ __html: formatHtml(privacyText.value) }}
          />
        </div>
      )}
    </div>
  );
};

export default Policy;
