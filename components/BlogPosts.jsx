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
        <section className="grid gap-6 rounded-[2rem] border border-border bg-white/95 p-6 shadow-card lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-end lg:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-600">
              From the blog
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              TruePower Journal
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-sub sm:mt-4 sm:text-lg">
              Practical installation guides, product advice, and real-world energy insights for Kenyan homes.
            </p>
            <p className="mt-3 text-sm text-sub">
              Showing {pagination?.totalItems || posts.length} article
              {(pagination?.totalItems || posts.length) !== 1 ? "s" : ""}
              {searchTerm ? <> for &quot;{searchTerm}&quot;</> : null}
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="rounded-[1.5rem] border border-border bg-gradient-to-br from-slate-50 via-white to-brand-50/40 p-4 shadow-sm"
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
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs leading-relaxed text-sub">
                Discover the latest stories, fixes, and field tips from the TruePower team.
              </p>
              <button type="submit" className="btn-primary shrink-0 px-4 py-2.5 text-sm">
                <ArrowRight size={16} />
                Search
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
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
              <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
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
                totalPages={pagination?.totalPages || 1}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
