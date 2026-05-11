import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Clock3, Tag } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useBlog } from '../context/BlogContext'
import BlogCard from '../components/BlogCard'
import Seo from '../components/Seo'

export default function BlogPostPage() {
  const { slug } = useParams()
  const { posts, getBlogPostBySlug, getRelatedBlogPosts } = useBlog()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true)
      try {
        let current = posts.find(item => item.slug === slug)
        if (!current) {
          current = await getBlogPostBySlug(slug)
        }
        setPost(current)
      } catch (error) {
        console.error('Failed to load blog post', error)
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) loadPost()
  }, [slug, posts, getBlogPostBySlug])

  const relatedPosts = useMemo(() => getRelatedBlogPosts(post, 3), [post, getRelatedBlogPosts])
  const bodyText = ((post?.body || post?.content) || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const readTime = Math.max(1, Math.ceil((bodyText.split(' ').filter(Boolean).length || 120) / 180))

  const publishedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('en-KE', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : ''

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center py-20 text-sub">
        Loading article...
      </div>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen pt-24">
        <div className="mx-auto w-full px-4 py-20 text-center sm:px-6 lg:px-10 xl:px-12">
          <p className="text-xl font-semibold text-ink">Article not found</p>
          <p className="mt-3 text-sub">The requested blog post could not be found.</p>
          <Link
            to="/blog"
            className="mt-6 inline-flex rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Go back to blog
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_34%,#ffffff_100%)] pt-24">
      <Seo
        title={post.title}
        description={post.excerpt || post.summary || 'Read the latest from TruePower Kenya.'}
        path={`/blog/${post.slug}`}
        image={post.featured_image_url}
        type="article"
      />

      <div className="mx-auto w-full px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            <ArrowLeft size={16} />
            Back to blog
          </Link>

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
                  <p className="max-w-xs text-3xl font-bold leading-tight text-white">{post.title}</p>
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
                    <p className="text-base leading-relaxed text-sub sm:text-lg">{post.excerpt}</p>
                  </div>
                )}

                {post.tags?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1.5 text-sm text-sub">
                        <Tag size={14} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-border bg-white p-6 shadow-card sm:p-8 lg:p-10">
            <article className="max-w-none text-[1.02rem] leading-8 text-ink [&_a]:text-brand-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-brand-200 [&_blockquote]:bg-brand-50/60 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink [&_li]:my-2 [&_ol]:my-6 [&_ol]:pl-6 [&_p]:my-5 [&_strong]:text-ink [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
              {((post.body || post.content) || '').trim().startsWith('<') ? (
                <div dangerouslySetInnerHTML={{ __html: post.body || post.content }} />
              ) : (
                <div className="whitespace-pre-line">{post.body || post.content}</div>
              )}
            </article>
          </section>

          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-600">More from the blog</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-ink">Related articles</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {relatedPosts.map(related => (
                  <BlogCard key={related.id} post={related} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
