import Image from "next/image";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import GradeBadge from "./GradeBadge";
import { Calendar, User, ArrowRight, Sparkles } from "lucide-react";
import type { PostCardProps } from "@/types/props/content";
import { rec } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";
import { formatPostDate } from "@/lib/formatPostDate";

export default function PostCard({ post, variant = "grid" }: PostCardProps) {
  if (!post) return null;
  // `post.x` on a truthy value (a primitive has no fields, as before)
  const p = rec(post);
  const href = `/blog/${String(p?.slug)}`;
  const formattedDate = formatPostDate(p?.date);

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-3xl lg:rounded-[36px] bg-dark border border-stone-200/80 p-6 sm:p-8 lg:p-10 shadow-md hover:shadow-xl transition-all duration-500">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Image Container */}
          <div className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] overflow-hidden rounded-2xl lg:rounded-3xl shadow-sm border border-stone-200/60 lg:order-2">
            <Image
              src={str(p?.image || "/blog.jpeg") ?? ""}
              alt={str(p?.title || "Featured Blog") ?? ""}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Story</span>
            </div>
          </div>

          {/* Content Container */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4 lg:order-1">
            <div className="flex items-center gap-2">
              <GradeBadge category={p?.category} />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900 leading-[1.2] group-hover:text-secondary transition-colors duration-300">
              <PreFetchLink href={href}>
                {nodeOf(p?.title)}
              </PreFetchLink>
            </h2>

            {nodeOf(p?.excerpt && (
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed line-clamp-3 font-medium">
                {nodeOf(p.excerpt)}
              </p>
            ))}

            {/* Meta Footer */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-500">
              {nodeOf(p?.author && (
                <div className="flex items-center gap-1.5 text-stone-700">
                  <User className="w-4 h-4 text-secondary" />
                  <span>{nodeOf(p.author)}</span>
                </div>
              ))}
              {nodeOf(formattedDate && (
                <div className="flex items-center gap-1.5 text-stone-500">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <time dateTime={str(p?.date)}>{nodeOf(formattedDate)}</time>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="pt-3">
              <PreFetchLink
                href={href}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary hover:bg-secondary/90 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-secondary/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </PreFetchLink>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className="group flex items-start gap-4 py-3 first:pt-0 last:pb-0 hover:bg-stone-200/40 rounded-xl p-2 transition-colors duration-200 cursor-pointer">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-stone-200/60 shadow-xs">
          <Image
            src={str(p?.image || "/blog.jpeg") ?? ""}
            alt={str(p?.title || "Blog Post") ?? ""}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            sizes="80px"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <GradeBadge category={p?.category} />
          <h3 className="text-xs sm:text-sm font-bold leading-snug text-stone-900 line-clamp-2 group-hover:text-secondary transition-colors">
            <PreFetchLink href={href}>
              {nodeOf(p?.title)}
            </PreFetchLink>
          </h3>
          {nodeOf(formattedDate && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
              <Calendar className="w-3 h-3 text-stone-400" />
              <time dateTime={str(p?.date)}>{nodeOf(formattedDate)}</time>
            </div>
          ))}
        </div>
      </article>
    );
  }

  // Grid variant (default)
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl lg:rounded-3xl bg-dark border border-stone-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer h-full">
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <Image
          src={str(p?.image || "/blog.jpeg") ?? ""}
          alt={str(p?.title || "Blog Post") ?? ""}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute top-3 left-3">
          <GradeBadge category={p?.category} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6 space-y-3">
        <h3 className="text-base sm:text-lg font-extrabold leading-snug text-stone-900 group-hover:text-secondary transition-colors duration-200 line-clamp-2">
          <PreFetchLink href={href}>
            {nodeOf(p?.title)}
          </PreFetchLink>
        </h3>
        {nodeOf(p?.excerpt && (
          <p className="line-clamp-3 text-xs sm:text-sm leading-relaxed text-stone-600 font-medium flex-1">
            {nodeOf(p.excerpt)}
          </p>
        ))}
        <div className="mt-auto pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-3">
            {nodeOf(p?.author && (
              <span className="flex items-center gap-1 font-semibold text-stone-700">
                <User className="w-3.5 h-3.5 text-secondary" />
                {nodeOf(p.author)}
              </span>
            ))}
            {nodeOf(formattedDate && (
              <span className="flex items-center gap-1 text-stone-400">
                <Calendar className="w-3.5 h-3.5" />
                {nodeOf(formattedDate)}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary group-hover:text-primary transition-colors">
            Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
