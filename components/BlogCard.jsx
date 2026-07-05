import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import {
  formatBlogDate,
  getBlogCoverFallback,
  getBlogExcerpt,
  getBlogReadTime,
} from "@/lib/blogs.js";

export default function BlogCard({ post, featured = false }) {
  if (!post) return null;

  const excerpt = getBlogExcerpt(post, featured ? 200 : 130);
  const publishedDate = formatBlogDate(post.published_at || post.created_at);
  const readTime = getBlogReadTime(post);
  const categoryLabel = post.category || "General";
  const cardImage = post.featured_image_url || post.cover_image_url || "";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-pop ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          featured ? "min-h-[360px] sm:min-h-[460px]" : "min-h-[220px] sm:min-h-[260px]"
        }`}
      >
        {cardImage ? (
          <img
            src={cardImage}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: getBlogCoverFallback(categoryLabel) }}
          />
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_38%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent" />

        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/95 backdrop-blur-md">
            {categoryLabel}
          </span>
          {featured ? (
            <span className="rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/95 backdrop-blur-md">
              Featured
            </span>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-white/85 sm:text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/35 px-3 py-1.5 backdrop-blur-sm">
              <CalendarDays size={13} />
              {publishedDate || "Latest update"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/35 px-3 py-1.5 backdrop-blur-sm">
              <Clock3 size={13} />
              {readTime} min read
            </span>
          </div>

          <div className="inline-flex rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/95 backdrop-blur-md">
            Read article
          </div>
        </div>
      </div>

      <div className={`flex flex-1 flex-col gap-4 p-4 sm:p-5 ${featured ? "lg:p-6" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sub">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
            {categoryLabel}
          </span>
          <span>{publishedDate || "Latest update"}</span>
          <span>{readTime} min read</span>
        </div>

        <h3
          className={`font-display font-bold leading-tight text-ink ${
            featured ? "text-xl sm:text-2xl" : "text-lg sm:text-[1.15rem]"
          }`}
        >
          {post.title}
        </h3>

        {excerpt ? (
          <p
            className={`text-sm leading-relaxed text-sub ${
              featured ? "line-clamp-3 sm:text-base" : "line-clamp-4"
            }`}
          >
            {excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-sm font-semibold text-brand-600">
          <span>{featured ? "Featured article" : "Read article"}</span>
          <span className="inline-flex items-center gap-1.5">
            Open
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
