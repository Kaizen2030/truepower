import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BlogCard({ post, featured = false }) {
  if (!post) return null

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : ''

  const plainTextBody = (post.body || post.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const excerpt = post.excerpt || plainTextBody.slice(0, featured ? 180 : 110) || ''
  const readTime = Math.max(1, Math.ceil((plainTextBody.split(' ').filter(Boolean).length || 80) / 180))

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group relative overflow-hidden rounded-[1.9rem] border border-slate-200 bg-slate-950 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop ${
        featured ? 'md:col-span-2 xl:col-span-2' : ''
      }`}
    >
      <div className={`relative min-h-[340px] ${featured ? 'md:min-h-[480px]' : ''}`}>
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1B4FD8_55%,#7dd3fc_100%)]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_36%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/42 to-transparent" />

        <div className="absolute left-4 top-4">
          {post.category && (
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md">
              {post.category}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
          {excerpt && featured && (
            <p className="mb-3 max-w-2xl text-sm leading-relaxed text-white/78 line-clamp-2">
              {excerpt}
            </p>
          )}
          <h2 className={`max-w-3xl font-display font-bold leading-tight text-white ${featured ? 'text-2xl sm:text-3xl lg:text-[2rem] line-clamp-3' : 'text-xl line-clamp-3'}`}>
            {post.title}
          </h2>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/72">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                {publishedDate || 'Latest update'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock3 size={13} />
                {readTime} min read
              </span>
            </div>

            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              Read
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
