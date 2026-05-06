import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  MapPin,
  Phone,
  ArrowRight,
  Check,
  Shield,
  Droplets,
  Sun,
  Store,
  Star,
  ThumbsUp,
  Truck,
  Users,
  Award,
  Clock,
  MessageCircle,
  Wrench,
} from 'lucide-react'
import { getPageContent } from '../lib/supabase'
import Seo from '../components/Seo'

const IconMap = {
  Users,
  Star,
  Zap,
  MapPin,
  Shield,
  Droplets,
  Sun,
  Store,
  MessageCircle,
  Award,
  Truck,
  Check,
  Clock,
}

function DynamicIcon({ name, size = 24, className = '' }) {
  const IconComponent = IconMap[name] || Zap
  return <IconComponent size={size} className={className} />
}

export default function AboutPage() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPageContent('about')
      .then(data => {
        setContent(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const pageData = content?.main ?? content ?? {}

  if (loading) {
    return (
      <main className="pt-[68px] min-h-screen bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-20 text-center">
          <div className="animate-pulse text-2xl text-sub">Loading...</div>
        </div>
      </main>
    )
  }

  const hero = pageData?.hero || {}
  const stats = pageData?.stats?.items || [
    { value: '500+', label: 'Customers Served', icon: 'Users' },
    { value: '4.9★', label: 'Average Rating', icon: 'Star' },
    { value: '4', label: 'Product Categories', icon: 'Zap' },
    { value: 'CBD', label: 'Nyamakima Showroom', icon: 'MapPin' },
  ]
  const story = pageData?.story || {}
  const showroom = pageData?.showroom || {}
  const cta = pageData?.cta || {}

  return (
    <main className="pt-[68px] min-h-screen bg-white">
      <Seo
        title="About TruePower Kenya"
        description="Learn about TruePower Kenya — our water heaters, pumps, solar and electrical solutions, Nyamakima showroom, and how we help homes with borehole water and low pressure."
        path="/about"
      />
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <span className="text-yellow-300 text-sm">{hero.badge || '🇰🇪 About TruePower'}</span>
              </div>
              <h1 className="font-display font-extrabold text-5xl lg:text-7xl mb-6 leading-tight">
                {hero.title || 'Hot water for every Kenyan home.'}
              </h1>
              <p className="text-brand-100 text-lg lg:text-xl mb-8 max-w-xl leading-relaxed">
                {hero.subtitle || 'Water heaters, solar and electrical solutions — selected for Kenyan homes, borehole water, and low-pressure plumbing.'}
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="https://wa.me/254701039256" target="_blank" rel="noreferrer" className="bg-white text-brand-600 hover:bg-brand-50 px-6 py-3 rounded-full font-display font-bold flex items-center gap-2">
                  <MessageCircle size={18} /> Talk to the Team
                </a>
                <Link to="/shop" className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-full font-display font-bold flex items-center gap-2">
                  View Products <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-brand-300 rounded-3xl blur-2xl opacity-30" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: 'Zap', text: '0+ Products', sub: 'Ready to quote' },
                    { icon: 'Truck', text: 'Same Day', sub: 'Pickup support' },
                    { icon: 'Droplets', text: 'Low Pressure', sub: 'Solutions for difficult installs' },
                  ].map(item => (
                    <div key={item.text} className="text-center p-4 bg-white/5 rounded-2xl">
                      <div className="text-brand-300 mb-2 flex justify-center"><DynamicIcon name={item.icon} size={28} /></div>
                      <div className="font-display font-bold text-white">{item.text}</div>
                      <div className="text-brand-200 text-xs">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="text-center group">
                <div className="text-brand-500 mb-2 flex justify-center group-hover:scale-110 transition-transform">
                  <DynamicIcon name={stat.icon} size={24} />
                </div>
                <p className="font-display font-extrabold text-2xl text-ink">{stat.value}</p>
                <p className="text-sub text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge mb-4">Our Story</div>
              <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-6">
                {story.title || 'Built by Kenyans, for Kenyans'}
              </h2>
              <div className="flex flex-col gap-5 text-sub leading-relaxed">
                {(story.paragraphs || []).length > 0 ? (
                  story.paragraphs.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>Most water heaters on the market are designed for European water quality and pressure standards. They fail fast in Nairobi's borehole-heavy, variable-pressure environment.</p>
                    <p>We visit factories, test products, and only stock units we'd put in our own homes. Our Nyamakima showroom means you can see and touch every product before buying.</p>
                    <p>Every sale comes with real advice — we help you pick the right heater for your building, tank position, and water source.</p>
                  </>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {(story.features || []).length > 0 ? (
                  story.features.map(f => (
                    <span key={f} className="flex items-center gap-1.5 text-sm text-ink bg-muted border border-border px-4 py-2 rounded-full">
                      <Check size={13} className="text-brand-500" /> {f}
                    </span>
                  ))
                ) : (
                  ['Borehole Tested', 'Low Pressure Approved', 'Solar Compatible', 'Nairobi Delivery', '1 Year Warranty', 'Expert Support'].map(f => (
                    <span key={f} className="flex items-center gap-1.5 text-sm text-ink bg-muted border border-border px-4 py-2 rounded-full">
                      <Check size={13} className="text-brand-500" /> {f}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.slice(0, 4).map((s, i) => (
                <div key={i} className="bg-muted rounded-2xl p-5 border border-border text-center group hover:border-brand-200 transition-all">
                  <div className="text-brand-500 mb-2 flex justify-center"><DynamicIcon name={s.icon} size={24} /></div>
                  <p className="font-display font-extrabold text-3xl text-ink mb-1">{s.value}</p>
                  <p className="text-sub text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="bg-gradient-to-br from-white to-brand-50 rounded-3xl overflow-hidden border border-border">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="badge mb-4">Visit Our Showroom</div>
                <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
                  {showroom.title || 'Nyamakima Showroom, Nairobi CBD'}
                </h2>
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-display font-semibold text-ink">Location</p>
                      <p className="text-sub text-sm">{showroom.address || 'Nyamakima, Nairobi Central Business District'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-display font-semibold text-ink">Contact</p>
                      <p className="text-sub text-sm">{showroom.phone || '+254 701 039 256'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-display font-semibold text-ink">Opening Hours</p>
                      <div className="text-sub text-sm space-y-1 mt-1">
                        {(showroom.hours || [
                          { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
                          { day: 'Saturday', hours: '9:00 AM – 5:00 PM' },
                          { day: 'Sunday', hours: 'Closed' },
                        ]).map((h, idx) => (
                          <p key={idx}>{h.day}: {h.hours}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="https://wa.me/254701039256" target="_blank" rel="noreferrer" className="btn-primary flex items-center gap-2">
                    <MessageCircle size={18} /> WhatsApp Us
                  </a>
                  <Link to="/shop" className="btn-outline flex items-center gap-2">
                    Browse Online <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="relative bg-brand-800 min-h-[300px] lg:min-h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin size={40} className="text-brand-300" />
                  </div>
                  <p className="text-white/80 text-sm">📍 {showroom.address?.split(',')[0] || 'Nyamakima, Nairobi CBD'}</p>
                  <p className="text-white/60 text-xs mt-2">Drop by anytime — we're ready to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-r from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white mb-4">
            {cta.title || "Ready to order? We're on WhatsApp."}
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            {cta.subtitle || 'Chat with us, ask questions, get a quote fast, and arrange pickup or delivery in Nairobi.'}
          </p>
          <a
            href={cta.button_link || 'https://wa.me/254701039256'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1fb85b] text-white font-display font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 text-lg shadow-lg"
          >
            <MessageCircle size={24} /> {cta.button_text || 'Chat Now on WhatsApp'}
          </a>
        </div>
      </section>
    </main>
  )
}


