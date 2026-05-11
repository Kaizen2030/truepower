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
        featured ? 'col-span-2 xl:col-span-2' : ''
      }`}
    >
      <div className={`relative min-h-[220px] sm:min-h-[340px] ${featured ? 'min-h-[280px] md:min-h-[480px]' : ''}`}>
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

        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          {post.category && (
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:px-3 sm:text-[10px] sm:tracking-[0.24em]">
              {post.category}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
          {excerpt && featured && (
            <p className="mb-2 hidden max-w-2xl text-sm leading-relaxed text-white/78 line-clamp-2 sm:block">
              {excerpt}
            </p>
          )}
          <h2 className={`max-w-3xl font-display font-bold leading-tight text-white ${featured ? 'text-lg sm:text-3xl lg:text-[2rem] line-clamp-3' : 'text-[15px] sm:text-xl line-clamp-3'}`}>
            {post.title}
          </h2>

          <div className="mt-3 flex items-end justify-between gap-3 sm:mt-4 sm:gap-4">
            <div className="flex flex-col gap-1 text-[11px] text-white/72 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:text-xs">
              <span className="flex items-center gap-1">
                <CalendarDays size={13} />
                {publishedDate || 'Latest update'}
              </span>
              <span className="flex items-center gap-1">
                <Clock3 size={13} />
                {readTime} min read
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white sm:gap-2 sm:text-sm">
              Read
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
