import PostCard from "./PostCard";
import AllPostsCard from "./AllPostsCard";
import Pagination from "@/Components/Shop/Pagination";
import type { BlogContentProps, BlogSectionHeadingProps } from "@/types/props/content";
import type { BlogListPost, TagPost } from "@/types/content";
import { fieldsOf, mapList, rec } from "@/lib/json";
import { keyFrom } from "@/lib/render";

// `post.slug` as a key: throws for a null post (toPost returns null for a falsy blog), as before.
const slugKey = (post: unknown): string | undefined => keyFrom(fieldsOf(post).slug);

// API returns category/author as objects and published_at as a display string —
// PostCard/GradeBadge expect flat string props (category, author) and a date.
function toPost(entry: unknown): TagPost | null {
  if (!entry) return null;
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

function toAllPost(entry: unknown): BlogListPost | null {
  if (!entry) return null;
  const blog = fieldsOf(entry);
  return {
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    image: blog.thumbnail,
    date: blog.published_at,
    readingTime: blog.reading_time,
    category: rec(blog.category)?.name,
    author: rec(blog.author)?.name,
  };
}

function SectionHeading({ id, eyebrow, children }: BlogSectionHeadingProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="w-1.5 h-7 bg-secondary rounded-full shrink-0" />
      <div>
        {eyebrow && (
          <span className="block text-[11px] font-bold uppercase tracking-widest text-secondary mb-0.5">
            {eyebrow}
          </span>
        )}
        <h2 id={id} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
          {children}
        </h2>
      </div>
    </div>
  );
}

export default function BlogContent({
  featured,
  recentPosts = [],
  popularPosts = [],
  trendingPosts = [],
  allPosts = [],
  allPostsPagination,
  currentPage = 1,
}: BlogContentProps) {
  const featuredPost = toPost(featured);
  const gridPosts = mapList(recentPosts, (blog) => toPost(blog));
  const popular = mapList(popularPosts, (blog) => toPost(blog));
  const trending = mapList(trendingPosts, (blog) => toPost(blog));
  const posts = mapList(allPosts, (blog) => toAllPost(blog));

  return (
    <div className="my-mt">
      <main className="space-y-12 sm:space-y-16">
        {/* Featured Section */}
        {featuredPost && (
          <section aria-labelledby="featured-heading">
            <PostCard post={featuredPost} variant="featured" />
          </section>
        )}

        {/* Recent Posts Section */}
        {gridPosts.length > 0 && (
          <section aria-labelledby="recent-heading">
            <SectionHeading id="recent-heading" eyebrow="Fresh off the press">
              Recent Posts
            </SectionHeading>
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {gridPosts.map((post) => (
                <PostCard key={slugKey(post)} post={post} variant="grid" />
              ))}
            </div>
          </section>
        )}

        {/* All Posts (main) + Popular/Trending sidebar */}
        <div className="pt-4 grid gap-10 lg:gap-12 lg:grid-cols-[1fr_360px]">
          {/* All Posts Section — every post, paginated */}
          {posts.length > 0 && (
            <section aria-labelledby="all-posts-heading" className="space-y-6">
              <SectionHeading id="all-posts-heading" eyebrow="The full archive">
                All Posts
              </SectionHeading>
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                {posts.map((post) => (
                  <AllPostsCard key={slugKey(post)} post={post} />
                ))}
              </div>
              <div className="pt-4">
                <Pagination
                  shopProducts={{ pagination: allPostsPagination }}
                  currentPage={currentPage}
                />
              </div>
            </section>
          )}

          {/* Popular & Trending Sidebar */}
          <aside className="lg:relative">
            <div className="flex flex-col gap-8 lg:sticky lg:top-8">
              {popular.length > 0 && (
                <section aria-labelledby="popular-heading">
                  <SectionHeading id="popular-heading" eyebrow="Reader favorites">
                    Popular Posts
                  </SectionHeading>
                  <div className="rounded-2xl lg:rounded-3xl bg-dark p-4 sm:p-5 shadow-xs border border-stone-200/80 divide-y divide-stone-200/60">
                    {popular.map((post) => (
                      <PostCard key={slugKey(post)} post={post} variant="list" />
                    ))}
                  </div>
                </section>
              )}

              {trending.length > 0 && (
                <section aria-labelledby="trending-heading">
                  <SectionHeading id="trending-heading" eyebrow="Hot Topics">
                    Trending Posts
                  </SectionHeading>
                  <div className="rounded-2xl lg:rounded-3xl bg-dark p-4 sm:p-5 shadow-xs border border-stone-200/80 divide-y divide-stone-200/60">
                    {trending.map((post) => (
                      <PostCard key={slugKey(post)} post={post} variant="list" />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
