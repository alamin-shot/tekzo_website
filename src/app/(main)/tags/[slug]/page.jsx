import { notFound } from "next/navigation";
import PostCard from "@/Components/Blog/PostCard";
import Pagination from "@/Components/Shop/Pagination";
import Banner from "@/Components/ReuseableComponent/Banner";
import { getBlogsByTag } from "@/lib/api";

function toPost(blog) {
  return {
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    image: blog.thumbnail,
    category: blog.category?.name,
    author: blog.author?.name,
    date: blog.published_at,
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogsByTag(slug);

  if (!data?.tag) return {};

  return {
    title: `#${data.tag.name} Articles | Tekzo Blog`,
    description: `Browse all blog posts tagged #${data.tag.name}.`,
  };
}

export default async function TagPage({ params, searchParams }) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const data = await getBlogsByTag(slug, currentPage);

  if (!data?.tag) notFound();

  const posts = (data.posts?.data ?? []).map(toPost);
  const pagination = {
    current_page: data.posts?.current_page,
    last_page: data.posts?.last_page,
    per_page: data.posts?.per_page,
    total: data.posts?.total,
  };

  return (
    <div className="">
      <Banner
        image={"/loginPage/contact-about-bg.webp"}
        title={`#${data.tag.name}`}
      />
      <div className="my-mt">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-stone-900">
          Posts tagged <span className="text-teal-700">{data.tag.name}</span>
        </h1>

        {posts.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} variant="grid" />
              ))}
            </div>
            <Pagination
              shopProducts={{ pagination }}
              currentPage={currentPage}
            />
          </>
        ) : (
          <p className="text-stone-500">No posts tagged {data.tag.name} yet.</p>
        )}
      </div>
    </div>
  );
}
