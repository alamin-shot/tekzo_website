import BlogContent from "@/Components/Blog/BlogContent";
import Banner from "@/Components/ReuseableComponent/Banner";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { getFeaturedBlog, getRecentBlogs, getPopularBlogs, getTrendingBlogs, getBlogs } from "@/lib/api";

const revalidate = 3600; // Revalidate every hour
export async function generateMetadata() {
  const featured = await getFeaturedBlog();
  const seo = featured?.seoData;

  if (!seo) return {};

  return {
    title: seo?.title,
    description: seo?.description,
    keywords: seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [],
    openGraph: {
      title: seo?.title,
      description: seo?.description,
      url: seo?.canonical,
      locale: "en_US",
      siteName: seo?.siteName,
      images: [
        {
          url: seo?.ogImage || seo?.banner || "/loginPage/contact-about-bg.webp",
          width: 1200,
          height: 630,
          alt: seo?.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.title,
      description: seo?.description,
      images: [seo?.ogImage || seo?.banner || "/loginPage/contact-about-bg.webp"],
    },
    alternates: {
      canonical: seo?.canonical,
    },
  };
}

export default async function BlogPage({ searchParams }) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const [featuredData, recentPosts, popularPosts, trendingPosts, allBlogs] = await Promise.all([getFeaturedBlog(), getRecentBlogs(), getPopularBlogs(), getTrendingBlogs(), getBlogs(currentPage, 12)]);

  return (
    <div className="">
      <Banner h1="TEKZO Blog" image={featuredData?.seoData?.banner || "/loginPage/contact-about-bg.webp"} title={"Blog"} />
      <BlogContent
        featured={featuredData?.featured_blog}
        recentPosts={recentPosts}
        popularPosts={popularPosts}
        trendingPosts={trendingPosts}
        allPosts={allBlogs?.data}
        allPostsPagination={{
          current_page: allBlogs?.current_page,
          last_page: allBlogs?.last_page,
          per_page: allBlogs?.per_page,
          total: allBlogs?.total,
        }}
        currentPage={currentPage}
      />
      <div className="mt-10">
        <PageDescription
          title="Learn More About TEKZO Blog & Insights"
          description={featuredData?.seoData?.description || "Explore the latest tech news, expert device reviews, buying guides, and smartphone tips from the TEKZO editorial team."}
        />
      </div>
    </div>
  );
}
