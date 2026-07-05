"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import Pagination from "@/components/Pagination";

function buildBlogLink({ search, category }) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (category) params.set("category", category);

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export default function BlogPosts({ posts = [], categories = [], pagination }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const [query, setQuery] = useState(searchTerm);

  useEffect(() => {
    setQuery(searchTerm);
  }, [searchTerm]);

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);
  const totalItems = pagination?.totalItems || posts.length;
  const totalPages = pagination?.totalPages || 1;
  const publishedLabel = totalItems === 1 ? "article" : "articles";

  const categoryLinks = useMemo(
    () => ["All Articles", ...categories.filter(Boolean)],
    [categories],
  );

  const handleSearch = (event) => {
    event.preventDefault();
    router.push(buildBlogLink({ search: query.trim(), category: activeCategory }));
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(27,79,216,0.09),transparent_26%),radial-gradient(circle_at_top_right,rgba(15,110,86,0.09),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#ffffff_38%)]">
      <div className="container py-8 lg:py-12">
        <section className="rounded-[2rem] border border-border bg-white/95 p-6 shadow-card lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.75fr)] lg:items-stretch">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-[linear-gradient(135deg,rgba(248,251,255,0.98),rgba(255,255,255,0.98))] p-6 sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-100/60 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-600">
                  From the blog
                </p>
                <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
                  TruePower Journal
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sub sm:text-lg">
                  Practical installation guides, product advice, and real-world energy insights for Kenyan homes and businesses.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 text-sm text-sub">
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
                    {totalItems} published {publishedLabel}
                  </span>
                  {searchTerm ? (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                      Search: “{searchTerm}”
                    </span>
                  ) : null}
                  {activeCategory ? (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                      Category: {activeCategory}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-border bg-white/90 p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sub">
                      Editorial
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      Guides, updates, and field notes
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-border bg-white/90 p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sub">
                      Format
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      Images, sections, and rich text
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-border bg-white/90 p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sub">
                      Layout
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      Magazine-style cards and article pages
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="rounded-[1.75rem] border border-border bg-gradient-to-br from-slate-50 via-white to-brand-50/35 p-5 shadow-sm"
            >
              <label
                htmlFor="blog-search"
                className="text-xs font-semibold uppercase tracking-[0.22em] text-sub"
              >
                Search articles
              </label>

              <div className="relative mt-3">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sub"
                />
                <input
                  id="blog-search"
                  type="search"
                  value={query}
                  placeholder="Search by title, topic, or author"
                  className="input min-h-[52px] rounded-full pl-11 pr-4"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-sm leading-relaxed text-sub">
                  Discover the latest stories, fixes, and field tips from the TruePower team.
                </p>
                <button type="submit" className="btn-primary w-full justify-center px-4 py-3 text-sm">
                  <ArrowRight size={16} />
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-border bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
                Categories
              </p>
              <p className="mt-2 text-sm text-sub">
                Filter the library by topic, author, or specialty.
              </p>
            </div>

            <p className="text-sm text-sub">
              Showing {posts.length} of {totalItems} published {publishedLabel}
              {searchTerm ? <> for “{searchTerm}”</> : null}
            </p>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
            {categoryLinks.map((category) => {
              const isAll = category === "All Articles";
              const nextCategory = isAll ? "" : category;
              const href = buildBlogLink({
                search: searchTerm,
                category: nextCategory,
              });
              const isActive = isAll ? !activeCategory : activeCategory === category;

              return (
                <Link
                  key={category}
                  href={href}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-brand-600 text-white shadow-md"
                      : "bg-muted text-sub hover:bg-brand-100 hover:text-brand-700"
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-border bg-white p-8 text-center shadow-card">
            <p className="text-lg font-semibold text-ink">No posts found</p>
            <p className="mt-2 text-sm text-sub">
              Try a different keyword or clear the selected category.
            </p>
          </div>
        ) : (
          <>
            {featuredPost ? (
              <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
                <BlogCard post={featuredPost} featured />

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
                  {remainingPosts.slice(0, 2).map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            ) : null}

            {remainingPosts.length > 2 ? (
              <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {remainingPosts.slice(2).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </section>
            ) : null}

            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
