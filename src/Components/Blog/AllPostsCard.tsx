import Image from "next/image";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import GradeBadge from "./GradeBadge";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import type { AllPostsCardProps } from "@/types/props/content";
import { rec } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";
import { formatPostDate } from "@/lib/formatPostDate";

export default function AllPostsCard({ post }: AllPostsCardProps) {
  if (!post) return null;
  // `post.x` on a truthy value (a primitive has no fields, as before)
  const p = rec(post);
  const href = `/blog/${String(p?.slug)}`;
  const formattedDate = formatPostDate(p?.date);

  return (
    <article className="group flex flex-col sm:flex-row gap-5 rounded-2xl lg:rounded-3xl bg-dark border border-stone-200/80 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="relative aspect-[16/10] sm:aspect-square w-full sm:w-44 lg:w-48 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        <Image
          src={str(p?.image || "/blog.jpeg") ?? ""}
          alt={str(p?.title || "Blog Post") ?? ""}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 200px"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between space-y-3 min-w-0">
        <div className="space-y-2">
          {nodeOf(p?.category && <GradeBadge category={p.category} />)}
          <h3 className="text-base sm:text-lg font-extrabold leading-snug text-stone-900 group-hover:text-secondary transition-colors duration-200 line-clamp-2">
            <PreFetchLink href={href}>
              {nodeOf(p?.title)}
            </PreFetchLink>
          </h3>
          {nodeOf(p?.excerpt && (
            <p className="line-clamp-3 text-xs sm:text-sm leading-relaxed text-stone-600 font-medium">
              {nodeOf(p.excerpt)}
            </p>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 font-medium">
          <div className="flex flex-wrap items-center gap-3">
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
            {nodeOf(p?.readingTime && (
              <span className="flex items-center gap-1 text-stone-400">
                <Clock className="w-3.5 h-3.5" />
                {nodeOf(p.readingTime)} min read
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
