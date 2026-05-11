import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useBlog } from '../context/BlogContext'
import BlogCard from '../components/BlogCard'
import Seo from '../components/Seo'

export default function BlogPage() {
  const { posts, categories, loading, refreshBlogs } = useBlog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')

  useEffect(() => {
    if (!posts.length) refreshBlogs()
  }, [posts.length, refreshBlogs])

  useEffect(() => {
    const category = searchParams.get('category') || ''
    setActiveCategory(category)
  }, [searchParams])

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts
    return posts.filter(post => post.category === activeCategory)
  }, [posts, activeCategory])

  const featuredPost = filteredPosts[0] || null
  const remainingPosts = filteredPosts.slice(1)

  const handleCategoryClick = (category) => {
    const next = activeCategory === category ? '' : category
    setActiveCategory(next)
    if (next) {
      setSearchParams({ category: next })
    } else {
      setSearchParams({})
    }
  }

  return (
    <main className="min-h-screen bg-white pt-24">
      <Seo title="Blog" description="Latest blog updates, guides, and case studies from TruePower Kenya." path="/blog" />

      <div className="mx-auto w-full max-w-[1500px] px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <section className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-brand-600">From the blog</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              TruePower Journal
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-sub sm:text-lg">
              Installation guides, product advice & solar water heating insights
            </p>
          </div>

          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sub" />
            <input
              type="text"
              placeholder="Search articles"
              className="w-full rounded-full border border-border bg-slate-50 py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-brand-300 focus:bg-white"
            />
          </div>
        </section>

        <section className="mt-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryClick('')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !activeCategory ? 'bg-brand-600 text-white shadow-md' : 'bg-muted text-sub hover:bg-brand-100 hover:text-brand-700'
              }`}
            >
              All articles
            </button>
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category ? 'bg-brand-600 text-white shadow-md' : 'bg-muted text-sub hover:bg-brand-100 hover:text-brand-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className={`animate-pulse rounded-[1.9rem] bg-slate-100 ${item === 1 ? 'h-[30rem] md:col-span-2' : 'h-[21.25rem]'}`} />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <section className="mt-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredPost && <BlogCard post={featuredPost} featured />}
              {remainingPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-border bg-white p-12 text-center shadow-card">
            <p className="text-lg font-semibold text-ink">No posts found.</p>
            <p className="mt-3 text-sub">Try removing the category filter or check back later for new articles.</p>
            <Link to="/blog" className="mt-5 inline-flex items-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
              Reset filter
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
