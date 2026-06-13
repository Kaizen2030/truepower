import { notFound } from "next/navigation";

import {
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blogs.js";
import { ArrowLeft, CalendarDays, Clock3, Tag } from "lucide-react";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { createSeo, DEFAULT_IMAGE } from "@/components/Seo";

export const dynamic = "force-dynamic";

// 🔥 SEO metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return createSeo({
      title: "Article not found",
      description: "Blog post not found",
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return createSeo({
    title: post.title,
    description: post.excerpt || post.summary || `Read ${post.title} on TruePower Kenya.`,
    path: `/blog/${slug}`,
    image: post.featured_image_url || DEFAULT_IMAGE,
    type: "article",
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  // ✅ 1. Get current post
  const post = await getBlogPostBySlug(slug);

  if (!post) return notFound();

  // 🔥 Related posts logic (server-side)
  const relatedPosts = await getRelatedPosts(post);

  const bodyText = (post?.body || post?.content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const readTime = Math.max(
    1,
    Math.ceil((bodyText.split(" ").filter(Boolean).length || 120) / 180),
  );

  const publishedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const isHtml = (post.body || post.content || "").trim().startsWith("<");

  return (
    <main className="min-h-screen bg-white container">
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <Link
          href="/blog"
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-3"
        >
          <ArrowLeft size={16} />
          Back to blog
        </Link>

        {/* HERO */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-stretch">
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-pop">
            {post.featured_image_url ? (
              <>
                <div className="aspect-square">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_38%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/56 via-slate-950/8 to-transparent" />
              </>
            ) : (
              <div className="flex aspect-square items-end bg-[linear-gradient(135deg,#0f172a_0%,#1B4FD8_52%,#7dd3fc_100%)] p-8">
                <p className="max-w-xs text-3xl font-bold leading-tight text-white">
                  {post.title}
                </p>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-white p-7 shadow-card sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-100/70 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 text-sm text-sub">
                {post.category && (
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
                    {post.category}
                  </span>
                )}
                {publishedDate && (
                  <span className="flex items-center gap-2">
                    <CalendarDays size={15} />
                    {publishedDate}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Clock3 size={15} />
                  {readTime} min read
                </span>
              </div>

              <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-[2.8rem]">
                {post.title}
              </h1>

              {post.excerpt && (
                <div className="mt-6 rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-5">
                  <p className="text-base leading-relaxed text-sub sm:text-lg">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {post.tags?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1.5 text-sm text-sub"
                    >
                      <Tag size={14} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-border bg-white p-6 shadow-card sm:p-8 lg:p-10">
          <article className="max-w-none text-[1.02rem] leading-8 text-ink [&_a]:text-brand-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-brand-200 [&_blockquote]:bg-brand-50/60 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink [&_li]:my-2 [&_ol]:my-6 [&_ol]:pl-6 [&_p]:my-5 [&_strong]:text-ink [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
            {(post.body || post.content || "").trim().startsWith("<") ? (
              <div
                dangerouslySetInnerHTML={{ __html: post.body || post.content }}
              />
            ) : (
              <div className="whitespace-pre-line">
                {post.body || post.content}
              </div>
            )}
          </article>
        </section>

        {/* RELATED */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-600">
                More from the blog
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink">
                Related articles
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedPosts.map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
