import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  MessageCircle,
  MapPin,
  Users,
  Sparkles,
  Award,
  Truck,
  Shield,
  Droplets,
  Sun,
  Store,
  Camera,
  Briefcase,
  ThumbsUp,
  ArrowRight,
  X,
  Quote,
} from 'lucide-react'
import { getGalleryImages, getTestimonials, getPageContent } from '../lib/supabase'

export default function PortfolioPage() {
  const [galleryImages, setGalleryImages] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [content, setContent] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGalleryImages(), getTestimonials(), getPageContent('portfolio')])
      .then(([gallery, testimonials, pageContent]) => {
        setGalleryImages(gallery || [])
        setTestimonials(testimonials || [])
        setContent(pageContent)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const pageData = content?.main ?? content ?? {}

  const filteredImages =
    activeCategory === 'all'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory)

  const categories = pageData?.galleryCategories || [
    { key: 'all', label: 'All Work', icon: <Briefcase size={14} /> },
    { key: 'installation', label: 'Installations', icon: <Sparkles size={14} /> },
    { key: 'showroom', label: 'Showroom', icon: <Camera size={14} /> },
    { key: 'product', label: 'Products', icon: <ThumbsUp size={14} /> },
  ]

  const stats = pageData?.stats || [
    { value: '500+', label: 'Happy Customers', icon: <Users size={24} /> },
    { value: '4.9★', label: 'Average Rating', icon: <Star size={24} /> },
    { value: '24/7', label: 'WhatsApp Support', icon: <MessageCircle size={24} /> },
    { value: 'Same Day', label: 'Nairobi Pickup', icon: <Truck size={24} /> },
  ]

  const hero = pageData?.hero || {
    badge: 'TruePower Portfolio',
    title: 'Our Portfolio',
    subtitle: 'Real installations, genuine reviews, and the proof that we deliver hot water solutions that actually work in Kenyan homes.',
  }

  const gallerySection = pageData?.gallerySection || {
    title: 'Project Gallery',
    subtitle: 'Browse recent installations, product finishes, and highlights from completed projects.',
  }

  const testimonialsSection = pageData?.testimonialsSection || {
    title: 'Customer Feedback',
    subtitle: 'Real feedback from real customers across Kenya.',
  }

  const promiseSection = pageData?.promiseSection || {
    title: 'Our Promise',
    subtitle: 'What makes us different',
  }

  const cta = pageData?.cta || {
    title: 'Ready to get hot water working perfectly?',
    subtitle: 'Chat with us on WhatsApp — we’ll help you choose the right solution for your home.',
    button_text: 'WhatsApp Us',
    button_link: 'https://wa.me/254701039256',
  }

  return (
    <main className="pt-[68px] min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/20 blur-3xl animate-pulse" />
        </div>

        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-20 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={16} className="text-yellow-300" />
            <span className="text-sm font-medium">{hero.badge}</span>
          </div>
          <h1 className="font-display font-extrabold text-5xl lg:text-6xl mb-4 leading-tight">
            {hero.title}
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">{hero.subtitle}</p>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-brand-500 mb-2 flex justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <p className="font-display font-extrabold text-2xl text-ink">{stat.value}</p>
                <p className="text-sub text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center mb-12">
            <div className="badge mb-4">⚡ How It Works</div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
              From "I Need Hot Water" to <br />
              <span className="text-brand-500">"This is Perfect"</span>
            </h2>
            <p className="text-sub max-w-xl mx-auto">3 simple steps. No confusion. No wrong purchases.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <MessageCircle size={32} />,
                title: 'Tell Us Your Situation',
                desc: '“I have borehole water and low pressure in my apartment” — that is all we need to start.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                step: '02',
                icon: <Award size={32} />,
                title: 'Get Expert Recommendations',
                desc: 'We share models, prices, and explain why each choice works for your setup.',
                color: 'from-emerald-500 to-emerald-600',
              },
              {
                step: '03',
                icon: <Truck size={32} />,
                title: 'Order & Install',
                desc: 'Pickup from our CBD shop or arrange delivery — with clear installation guidance.',
                color: 'from-purple-500 to-purple-600',
              },
            ].map((step) => (
              <div key={step.step} className="relative group">
                <div className={`bg-gradient-to-br ${step.color} rounded-2xl p-6 text-white text-center relative z-10 transition-all hover:-translate-y-2 hover:shadow-xl`}>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-ink font-display font-bold shadow-md">
                    {step.step}
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center mb-10">
            <div className="badge mb-4">{gallerySection.title}</div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
              {gallerySection.title}
            </h2>
            <p className="text-sub max-w-2xl mx-auto">{gallerySection.subtitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-display font-semibold transition-all ${
                  activeCategory === cat.key
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-muted text-sub hover:bg-brand-100 hover:text-brand-600'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-muted rounded-2xl animate-pulse h-64" />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <Camera size={48} className="mx-auto text-faint mb-4" />
              <p className="text-sub">No gallery images yet. Check back soon!</p>
              <p className="text-faint text-sm mt-2">Admins can add images in the dashboard → Gallery tab</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img.image_url}
                    alt={img.title || 'Installation'}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="font-display font-semibold">{img.title || 'Installation'}</p>
                      <p className="text-white/70 text-sm">{img.description}</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                    {img.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center mb-12">
            <div className="badge mb-4">{testimonialsSection.title}</div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
              {testimonialsSection.title}
            </h2>
            <p className="text-sub max-w-xl mx-auto">{testimonialsSection.subtitle}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-48" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-16">
              <Star size={48} className="mx-auto text-faint mb-4" />
              <p className="text-sub">No testimonials yet. Check back soon!</p>
              <p className="text-faint text-sm mt-2">Admins can add testimonials in the dashboard</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div key={t.id || idx} className="bg-white rounded-2xl p-6 border border-border hover:shadow-product-hover transition-all group">
                  <div className="flex gap-1 mb-4 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < (t.rating || 5) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <Quote size={24} className="text-brand-200 mb-3" />
                  <p className="text-ink mb-4 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-display font-bold">
                      {t.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-ink text-sm">{t.name}</p>
                      <p className="text-sub text-xs flex items-center gap-1">
                        <MapPin size={10} /> {t.location || 'Kenya'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center mb-12">
            <div className="badge mb-4">{promiseSection.title}</div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
              {promiseSection.subtitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Shield size={28} />,
                title: 'Borehole Ready',
                desc: 'Heavy-duty copper coils that resist corrosion. Lasts 3x longer in salty water.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: <Droplets size={28} />,
                title: 'Low Pressure? Solved',
                desc: 'Built-in booster pumps that work even when your tank is on the ground floor.',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: <Sun size={28} />,
                title: 'Solar Compatible',
                desc: 'Works alongside your existing solar system. Heat water efficiently even on cloudy days.',
                color: 'bg-yellow-50 text-yellow-600',
              },
              {
                icon: <Store size={28} />,
                title: 'See Before You Buy',
                desc: 'Visit our Nyamakima showroom. See products in person, get expert advice.',
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((service) => (
              <div key={service.title} className="group text-center p-6 rounded-2xl border border-border hover:shadow-product-hover transition-all hover:-translate-y-1 bg-white">
                <div className={`${service.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2">{service.title}</h3>
                <p className="text-sub text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-r from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white mb-4">{cta.title}</h2>
          <p className="text-brand-100 text-lg mb-8">{cta.subtitle}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={cta.button_link} target="_blank" rel="noreferrer" className="bg-white text-brand-600 hover:bg-brand-50 font-display font-bold px-8 py-3 rounded-full transition-all flex items-center gap-2">
              <MessageCircle size={18} /> {cta.button_text}
            </a>
            <Link to="/shop" className="bg-brand-500 hover:bg-brand-400 text-white font-display font-bold px-8 py-3 rounded-full transition-all flex items-center gap-2 border border-white/20">
              Browse Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-brand-300 transition-colors"
            >
              <X size={28} />
            </button>
            <img src={selectedImage.image_url} alt={selectedImage.title} className="w-full rounded-2xl" />
            {(selectedImage.title || selectedImage.description) && (
              <div className="mt-4 text-white text-center">
                {selectedImage.title && <p className="font-display font-semibold text-xl">{selectedImage.title}</p>}
                {selectedImage.description && <p className="text-white/70">{selectedImage.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

