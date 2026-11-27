import BlogContent from "@/Components/Blog/BlogContent";
import Banner from "@/Components/ReuseableComponent/Banner";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { getFeaturedBlog, getRecentBlogs, getPopularBlogs, getTrendingBlogs, getBlogs } from "@/lib/api";
import type { Metadata } from "next";
import type { SearchPageProps } from "@/types/route";
import { fieldsOf, rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

const revalidate = 3600; // Revalidate every hour
export async function generateMetadata(): Promise<Metadata> {
  const featured = await getFeaturedBlog();
  const seoData = rec(featured)?.seoData;

  if (!seoData) return {};
  // a truthy primitive seoData has no fields, as before
  const seo = rec(seoData);

  return {
    title: str(seo?.title),
    description: str(seo?.description),
    keywords: tagsOr(seo?.tags, []),
    openGraph: {
      title: str(seo?.title),
      description: str(seo?.description),
      url: str(seo?.canonical),
      locale: "en_US",
      siteName: str(seo?.siteName),
      images: [
        {
          url: str(seo?.ogImage || seo?.banner || "/loginPage/contact-about-bg.webp") ?? "",
          width: 1200,
          height: 630,
          alt: str(seo?.title),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: str(seo?.title),
      description: str(seo?.description),
      images: [str(seo?.ogImage || seo?.banner || "/loginPage/contact-about-bg.webp") ?? ""],
    },
    alternates: {
      canonical: str(seo?.canonical),
    },
  };
}

export default async function BlogPage({ searchParams }: SearchPageProps) {
  const { page } = fieldsOf(await searchParams);
  const currentPage = Number(page) || 1;

  const [featuredData, recentPosts, popularPosts, trendingPosts, allBlogs] = await Promise.all([getFeaturedBlog(), getRecentBlogs(), getPopularBlogs(), getTrendingBlogs(), getBlogs(currentPage, 12)]);

  return (
    <div className="">
      <Banner h1="TEKZO Blog" image={rec(rec(featuredData)?.seoData)?.banner || "/loginPage/contact-about-bg.webp"} title={"Blog"} />
      <BlogContent
        featured={rec(featuredData)?.featured_blog}
        recentPosts={recentPosts}
        popularPosts={popularPosts}
        trendingPosts={trendingPosts}
        allPosts={rec(allBlogs)?.data}
        allPostsPagination={{
          current_page: rec(allBlogs)?.current_page,
          last_page: rec(allBlogs)?.last_page,
          per_page: rec(allBlogs)?.per_page,
          total: rec(allBlogs)?.total,
        }}
        currentPage={currentPage}
      />
      <div className="mt-10">
        <PageDescription
          title="Learn More About TEKZO Blog & Insights"
          description={rec(rec(featuredData)?.seoData)?.description || "Explore the latest tech news, expert device reviews, buying guides, and smartphone tips from the TEKZO editorial team."}
        />
      </div>
    </div>
  );
}
