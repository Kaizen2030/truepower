"use client";
import { getPublishedBlogs, getBlogCategories } from "@/lib/supabase.js";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import { useState } from "react";
import { useRouter } from "next/navigation";

// 🔥 SERVER COMPONENT (SEO CONTENT LOADS HERE)

export default function BlogPosts({ posts, categories, pagination }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const [query, setQuery] = useState(searchTerm);
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/blog?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="min-h-screen bg-white container mb-5">
      {/* HEADER */}
      <section className="grid gap-5 border-b border-border pb-6 sm:gap-6 sm:pb-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-brand-600">
            From the blog
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
            TruePower Journal
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-sub sm:mt-4 sm:text-lg">
            Installation guides, product advice & solar water heating insights
          </p>
          <p className="text-sm text-gray-500">
            {pagination.totalItems} article
            {pagination.totalItems !== 1 ? "s" : ""}
            {searchTerm && <> for "{searchTerm}"</>}
          </p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sub"
            />
            <input
              type="text"
              value={query}
              placeholder="Search articles"
              className="w-full rounded-full border border-border bg-slate-50 py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-brand-300 focus:bg-white"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>
      </section>

      {/* CATEGORIES */}
      <section className="mt-5 sm:mt-6">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
          {/* ALL */}
          <Link
            href="/blog"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              !activeCategory
                ? "bg-brand-600 text-white shadow-md"
                : "bg-muted text-sub hover:bg-brand-100 hover:text-brand-700"
            }`}
          >
            All Articles
          </Link>

          {/* CATEGORY LINKS */}

          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blog?category=${cat}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === cat
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-muted text-sub hover:bg-brand-100 hover:text-brand-700"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* POSTS */}
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {featuredPost && <BlogCard post={featuredPost} featured />}

        {remainingPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </section>

      {posts.length === 0 && (
        <p className="mt-10 text-center text-gray-500">No posts found</p>
      )}

      <div>
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          basePath="/blog"
        />
      </div>
    </main>
  );
}
