import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/Components/Blog/PostCard";
import Pagination from "@/Components/Shop/Pagination";
import Banner from "@/Components/ReuseableComponent/Banner";
import { getBlogsByTag } from "@/lib/api";
import type { ParamsOnlyProps, SlugPageProps } from "@/types/route";
import type { TagPost } from "@/types/content";
import { fieldsOf, mapList, rec } from "@/lib/json";
import { keyFrom, nodeOf } from "@/lib/render";

// `blog.slug` etc. — throws for a null blog, as before.
function toPost(entry: unknown): TagPost {
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
  const data = await getBlogsByTag(slug);

  const tag = rec(data)?.tag;
  if (!tag) return {};

  return {
    title: `#${String(rec(tag)?.name)} Articles | Tekzo Blog`,
    description: `Browse all blog posts tagged #${String(rec(tag)?.name)}.`,
  };
}

export default async function TagPage({ params, searchParams }: SlugPageProps) {
  const { slug } = await params;
  const { page } = fieldsOf(await searchParams);
  const currentPage = Number(page) || 1;

  const data = rec(await getBlogsByTag(slug, currentPage));

  if (!data?.tag) notFound();

  const postsData = rec(data.posts);
  const posts = mapList(postsData?.data ?? [], (entry) => toPost(entry));
  const pagination = {
    current_page: postsData?.current_page,
    last_page: postsData?.last_page,
    per_page: postsData?.per_page,
    total: postsData?.total,
  };
  const tagName = rec(data.tag)?.name;

  return (
    <div className="">
      <Banner
        image={"/loginPage/contact-about-bg.webp"}
        title={`#${String(tagName)}`}
        h1={undefined}
        hideImageOnMobile={undefined}
      />
      <div className="my-mt">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-stone-900">
          Posts tagged <span className="text-teal-700">{nodeOf(tagName)}</span>
        </h1>

        {posts.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((post) => (
                <PostCard key={keyFrom(post.slug)} post={post} variant="grid" />
              ))}
            </div>
            <Pagination
              shopProducts={{ pagination }}
              currentPage={currentPage}
            />
          </>
        ) : (
          <p className="text-stone-500">No posts tagged {nodeOf(tagName)} yet.</p>
        )}
      </div>
    </div>
  );
}
