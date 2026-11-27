import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Banner from "@/Components/ReuseableComponent/Banner";
import GradeBadge from "@/Components/Blog/GradeBadge";
import PostCard from "@/Components/Blog/PostCard";
import ShareButtons from "@/Components/Blog/ShareButtons";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { getBlogBySlug, getRecentBlogs } from "@/lib/api";
import { formatHtml } from "@/lib/formatHtml";
import { SITE_URL, absoluteUrl, serializeJsonLd, toIsoDate } from "@/lib/seo/jsonLd";
import type { Metadata } from "next";
import type { ParamsOnlyProps } from "@/types/route";
import type { TagPost } from "@/types/content";
import { fieldsOf, filterList, lengthOpt, mapList, rec, requireString } from "@/lib/json";
import { idKey, keyFrom, nodeOf, str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

// User model has no avatar field yet — first + last letter of the name
// stands in until one exists.
// (`name?.trim()` threw for a non-string name; kept)
function getInitials(name: unknown): string {
  const trimmed = name === null || name === undefined ? undefined : requireString(name).trim();
  if (!trimmed) return "";
  const first = trimmed.charAt(0);
  const last = trimmed.charAt(trimmed.length - 1);
  return (first + last).toUpperCase();
}

// `blog.slug` etc. — throws for a null blog, as before.
function toRelatedPost(entry: unknown): TagPost {
  const blog = fieldsOf(entry);
  return {
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    image: blog.thumbnail,
    category: rec(blog.category)?.name,
    author: rec(blog.author)?.name,
    date: blog.published_at,
  };
}

export async function generateMetadata({ params }: ParamsOnlyProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  const seoData = rec(post)?.seoData;

  if (!post || !seoData) return {};
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
      images: [{ url: str(seo?.ogImage || "/blog.jpeg") ?? "", width: 1200, height: 630, alt: str(seo?.title) }],
    },
    twitter: {
      card: "summary_large_image",
      title: str(seo?.title),
      description: str(seo?.description),
      images: [str(seo?.ogImage || "/blog.jpeg") ?? ""],
    },
    alternates: {
      canonical: str(seo?.canonical),
    },
  };
}

export default async function BlogDetailsPage({ params }: ParamsOnlyProps) {
  const { slug } = await params;
  const [data, recentBlogs] = await Promise.all([getBlogBySlug(slug), getRecentBlogs()]);

  if (!data) notFound();
  // `post.x` on a truthy payload (a primitive has no fields, as before)
  const post = fieldsOf(data);
  const author = rec(post.author);
  const category = rec(post.category);
  const seoData = rec(post.seoData);

  const relatedPosts = mapList(post.related_blogs ?? [], (blog) => toRelatedPost(blog));
  const recentPosts = filterList(recentBlogs, (b) => fieldsOf(b).slug !== slug)
    .slice(0, 4)
    .map((blog) => toRelatedPost(blog));

  // AI Schema Injection
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "url": seoData?.canonical || `${SITE_URL}/blog/${slug}`,
    "mainEntityOfPage": seoData?.canonical || `${SITE_URL}/blog/${slug}`,
    "image": absoluteUrl(post.banner || post.thumbnail || "/blog.jpeg"),
    // published_at can be a display string; toIsoDate() drops unparseable values
    "datePublished": toIsoDate(post.published_at),
    "dateModified": toIsoDate(post.updated_at) || toIsoDate(post.published_at),
    "author": {
      "@type": "Person",
      "name": author?.name || "TEKZO Editorial Team",
      "url": absoluteUrl(author?.profile_url) || `${SITE_URL}/about-us`,
    },
    "publisher": {
      "@type": "Organization",
      "name": "TEKZO",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/nav-logo.png`
      }
    }
  };

  return (
    <div className="">
      {/* AI Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }}
      />

      {/* Page Banner */}
      <Banner image={"/loginPage/contact-about-bg.webp"} title={"Blog Details"} />

      {/* Main Container */}
      <main className="my-mt">
        {/* Post Title Section */}
        <div className="mx-auto max-w-5xl text-center space-y-4 mb-8">
          {nodeOf(category?.name && (
            <div className="flex justify-center">
              <GradeBadge category={category.name} />
            </div>
          ))}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight">{nodeOf(post.title)}</h1>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-stone-500 font-medium">
            {nodeOf(author?.name && (
              <div className="flex items-center gap-2">
                {author.avatar ? (
                  <Image src={str(author.avatar) ?? ""} alt={str(author.name) ?? ""} width={32} height={32} className="h-8 w-8 rounded-full object-cover border border-stone-200" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white shadow-xs">{getInitials(author.name)}</div>
                )}
                <span className="font-semibold text-stone-800">{nodeOf(author.name)}</span>
              </div>
            ))}
            {nodeOf(author?.name && post.published_at && <span className="text-stone-300">•</span>)}
            {nodeOf(post.published_at && <time dateTime={toIsoDate(post.published_at)}>{nodeOf(post.published_at)}</time>)}
            {nodeOf(post.reading_time && <span className="text-stone-300">•</span>)}
            {nodeOf(post.reading_time && <span>{nodeOf(post.reading_time)} min read</span>)}
          </div>
        </div>

        {/* Featured Main Image */}
        <div className="mx-auto max-w-6xl mb-12">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-lg">
            <Image src={str(post.banner || post.thumbnail || "/blog.jpeg") ?? ""} alt={str(post.title) ?? ""} fill className="object-cover" priority fetchPriority="high" sizes="(max-width: 1280px) 100vw, 1280px" />
          </div>
        </div>

        {/* Main Article Content & Sidebar */}
        <article className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:gap-12 lg:grid-cols-[1fr_320px]">
            {/* Article Content */}
            <div className="min-w-0">
              <div className="prose prose-base sm:prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-stone-900 prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-2xl sm:prose-h2:text-3xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:text-xl sm:prose-h3:text-2xl prose-p:leading-relaxed prose-p:text-stone-700 prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:bg-dark prose-blockquote:py-4 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:not-italic prose-blockquote:rounded-r-2xl prose-blockquote:text-stone-800 prose-strong:text-stone-900 prose-img:rounded-2xl prose-img:shadow-md rendered-html">
                <div dangerouslySetInnerHTML={{ __html: formatHtml(post.content || "") }} />
              </div>

              {/* Tags */}
              {/* (`x?.length > 0` applies ToNumber to the length, as Number() does) */}
              {Number(lengthOpt(post.tags)) > 0 && (
                <div className="mt-10 border-t border-stone-200/80 pt-8">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Tagged In</h3>
                  <div className="flex flex-wrap gap-2">
                    {mapList(post.tags, (tag) => (
                      <Link
                        key={idKey(tag)}
                        href={`/tags/${String(fieldsOf(tag).slug)}`}
                        className="rounded-full bg-dark border border-stone-200/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-stone-700 transition-all hover:bg-secondary hover:text-white shadow-xs"
                      >
                        #{nodeOf(fieldsOf(tag).name)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="mt-8 rounded-2xl sm:rounded-3xl border border-stone-200/80 bg-dark p-6 lg:p-8 shadow-xs">
                <h3 className="mb-4 text-base sm:text-lg font-bold text-stone-900">Share this article</h3>
                <ShareButtons url={seoData?.canonical} title={post.title} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-8 lg:h-fit">
              {recentPosts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-secondary rounded-full inline-block" />
                    Recent Posts
                  </h3>
                  <div className="rounded-2xl lg:rounded-3xl bg-dark p-4 sm:p-5 shadow-xs border border-stone-200/80 divide-y divide-stone-200/60">
                    {recentPosts.map((recentPost) => (
                      <PostCard key={keyFrom(recentPost.slug)} post={recentPost} variant="list" />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </article>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 py-12 lg:py-16 border-t border-stone-200/80">
            <div className="mx-auto max-w-6xl">
              <div className="mb-10 text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900">Related Articles</h2>
                <p className="text-sm sm:text-base text-stone-600 font-medium">More insights from {nodeOf(category?.name || "this category")}</p>
              </div>

              <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {relatedPosts.map((relatedPost) => (
                  <PostCard key={keyFrom(relatedPost.slug)} post={relatedPost} variant="grid" />
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2.5 rounded-full bg-secondary hover:bg-secondary/90 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-secondary/20 transition-all hover:-translate-y-0.5"
                >
                  <span>View All Articles</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Page Description Section */}
        <div className="mx-auto max-w-6xl px-4 mt-8">
          <PageDescription
            title={`Learn More About ${String(post.title)}`}
            description={post.excerpt || seoData?.description}
          />
        </div>
      </main>
    </div>
  );
}
