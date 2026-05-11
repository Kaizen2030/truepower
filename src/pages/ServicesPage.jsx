import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Zap,
  Sun,
  Droplets,
  ToggleRight,
  Wrench,
  PhoneCall,
  Sparkles,
  Clock,
  Shield,
  ShieldCheck,
  Star,
  Award,
  Truck,
  MessageCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'

const IconMap = {
  Zap,
  Sun,
  Droplets,
  ToggleRight,
  Wrench,
  PhoneCall,
  Sparkles,
  Clock,
  Shield,
  ShieldCheck,
  Star,
  Award,
  Truck,
}

function DynamicIcon({ name, size = 24, className = '' }) {
  const Icon = IconMap[name] || Zap
  return <Icon size={size} className={className} />
}

function ServiceImageCarousel({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const imgCount = images?.length || 0

  useEffect(() => {
    if (imgCount <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % imgCount)
    }, 4000)
    return () => clearInterval(timer)
  }, [imgCount])

  if (!imgCount) {
    return (
      <div className="relative w-full h-36 sm:h-56 lg:h-80 xl:h-[26rem] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
        <Sparkles size={36} className="text-brand-300 sm:h-12 sm:w-12" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <p className="text-center text-xs font-medium text-white sm:text-sm">Images coming soon</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl bg-gray-900">
      <div className="relative w-full h-36 sm:h-56 lg:h-80 xl:h-[26rem]">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: idx === currentIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: idx === currentIndex ? 1 : 0,
            }}
          >
            <img
              src={img.url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-55"
            />
            <img
              src={img.url}
              alt={img.caption || title}
              className="relative w-full h-full object-contain p-2 sm:p-4 lg:p-5 z-10"
              onError={(e) => { e.target.src = 'https://placehold.co/800x800?text=TruePower' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-black/10 z-10" />
            {img.caption && (
              <p className="absolute bottom-3 left-3 right-3 text-[11px] font-medium text-white drop-shadow z-20 sm:bottom-6 sm:left-4 sm:right-4 sm:text-sm">
                {img.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {imgCount > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-20 sm:bottom-4 sm:gap-1.5">
          {images.map((_, idx) => (
            <div
              key={idx}
              className="rounded-full transition-all duration-500"
              style={{
                width: idx === currentIndex ? 16 : 5,
                height: 5,
                background: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceCard({ service, index }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const animationDelay = index * 100

  return (
    <div
      className="group rounded-2xl sm:rounded-3xl bg-white border border-border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
      style={{ animation: `fadeUp 0.6s ease-out ${animationDelay}ms forwards`, opacity: 0 }}
    >
      <ServiceImageCarousel images={service.images?.length ? service.images : service.image_url ? [{ url: service.image_url, caption: '' }] : []} title={service.title} />

      <div className="p-3 sm:p-5 lg:p-7">
        <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
          <div>
            <h3 className="mb-1 font-display text-base font-bold leading-tight text-ink transition-colors duration-300 group-hover:text-brand-500 sm:mb-2 sm:text-xl lg:text-2xl">
              {service.title}
            </h3>
            <div className="hidden items-center gap-2 text-sm text-sub sm:flex">
              <Clock size={14} />
              <span>Quick response</span>
              <span className="w-1 h-1 rounded-full bg-sub" />
              <Star size={14} className="text-yellow-400" />
              <span>4.9/5 rating</span>
            </div>
            <div className="sm:hidden">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-sub">
                <Clock size={11} />
                Quick quote
              </span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 sm:h-12 sm:w-12 sm:rounded-2xl">
            <DynamicIcon name={service.icon_name} size={16} className="text-brand-500 transition-colors group-hover:text-white sm:h-[22px] sm:w-[22px]" />
          </div>
        </div>

        <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-sub sm:mb-5 sm:text-sm lg:text-base">{service.description}</p>

        {service.badge_text && (
          <div className="mb-3 inline-block rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 sm:mb-4 sm:px-3">
            <span className="text-[10px] font-semibold text-brand-600 sm:text-xs">{service.badge_text}</span>
          </div>
        )}

        {service.features?.length > 0 && (
          <div className={`space-y-2 overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-96' : 'max-h-24'}`}>
            {service.features.slice(0, isExpanded ? undefined : 3).map((feature, idx) => (
              <div key={idx} className="hidden items-center gap-2 text-sm text-ink sm:flex">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check size={10} className="text-emerald-600" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {service.features?.length > 3 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 hidden items-center gap-1 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600 sm:flex"
          >
            {isExpanded ? 'Show less' : `Show ${service.features.length - 3} more features`}
            <ArrowRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}

        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 sm:mt-6 sm:flex-row sm:gap-3 sm:pt-5">
          <a
            href={`https://wa.me/254701039256?text=${encodeURIComponent(`Hi! I'm interested in your ${service.title} service. Can you share more details?`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-3 py-2 text-[11px] font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-brand-600 hover:to-brand-700 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <MessageCircle size={14} className="sm:h-4 sm:w-4" /> Get Quote
          </a>
          <Link
            to="/shop"
            className="hidden flex-1 items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-300 hover:border-brand-300 hover:text-brand-600 sm:flex"
          >
            Products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error loading services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const filters = [
    { key: 'all', label: 'All Services', icon: Sparkles },
    { key: 'Security', label: 'Security', icon: ShieldCheck },
    { key: 'Water', label: 'Water Heaters', icon: Droplets },
    { key: 'Solar', label: 'Solar', icon: Sun },
    { key: 'Electrical', label: 'Electrical', icon: ToggleRight },
    { key: 'Pumps', label: 'Pumps', icon: Zap },
    { key: 'Repairs', label: 'Repairs', icon: Wrench },
    { key: 'Consultation', label: 'Consultation', icon: PhoneCall },
  ]

  const filteredServices = activeFilter === 'all'
    ? services
    : services.filter(s => s.category === activeFilter)

  const stats = [
    { value: '500+', label: 'Projects Completed', icon: Award },
    { value: '98%', label: 'Customer Satisfaction', icon: Star },
    { value: '24/7', label: 'WhatsApp Support', icon: MessageCircle },
    { value: '2hr', label: 'Response Time', icon: Clock },
  ]

  return (
    <main className="pt-[68px] min-h-screen bg-white overflow-x-hidden">
      <Seo
        title="Professional Services | Water Heaters, Solar & Electrical"
        description="TruePower Kenya - electric fence, CCTV, gate automation, inverters, solar, water heaters, fridge repair, washing machine repair and more across Nairobi."
        path="/services"
      />

      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        </div>

        <div className="relative w-full mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-10 xl:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Expert Services in Nairobi</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight">
              Professional <br />
              <span className="text-yellow-300">Installation & Repair</span>
            </h1>
            <p className="text-white/90 text-base sm:text-lg lg:text-xl mb-8 max-w-xl leading-relaxed">
              From electric fence and CCTV to water heaters, solar systems, inverters, and appliance repair - Nairobi's most trusted service team.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/254701039256"
                target="_blank"
                rel="noreferrer"
                className="bg-white text-brand-600 hover:bg-brand-50 px-8 py-3.5 rounded-full font-display font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
              >
                <MessageCircle size={18} /> Talk to an Expert
              </a>
              <Link
                to="/portfolio"
                className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-3.5 rounded-full font-display font-bold flex items-center gap-2 transition-all hover:scale-105 border border-white/20"
              >
                View Portfolio <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white relative z-10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-brand-500 mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon size={28} />
                </div>
                <p className="font-display font-extrabold text-3xl text-ink">{stat.value}</p>
                <p className="text-sub text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/30 border-b border-border sticky top-[68px] z-30 backdrop-blur-md bg-white/95">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-full font-display font-semibold text-sm transition-all duration-300 sm:px-5 ${
                  activeFilter === filter.key
                    ? 'bg-brand-500 text-white shadow-lg scale-105'
                    : 'bg-white border border-border text-sub hover:border-brand-300 hover:text-brand-500 hover:scale-105'
                }`}
              >
                <filter.icon size={14} />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-2 lg:gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[18rem] rounded-2xl bg-muted animate-pulse sm:h-[24rem] lg:h-[500px] lg:rounded-3xl" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="text-brand-300" />
              </div>
              <h3 className="font-display font-bold text-2xl text-ink mb-2">Coming Soon</h3>
              <p className="text-sub">New services are being added. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-2 xl:gap-10">
              {filteredServices.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-br from-brand-50 to-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center mb-12">
            <div className="badge mb-4">Why Choose TruePower</div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
              Experience That <span className="text-brand-500">Speaks for Itself</span>
            </h2>
            <p className="text-sub max-w-2xl mx-auto">
              We don't just sell products - we deliver complete solutions backed by years of expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Warranty on All Work',
                desc: 'All installations come with a service warranty. We stand behind our work.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: Truck,
                title: 'Same-Day Service',
                desc: 'Most Nairobi orders are same-day pickup or delivery. Emergency repairs available.',
                color: 'from-emerald-500 to-emerald-600'
              },
              {
                icon: Award,
                title: 'Certified Technicians',
                desc: 'Our team is trained on all major brands and installation types.',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((item) => (
              <div
                key={item.title}
                className="group text-center p-8 rounded-2xl bg-white border border-border hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <item.icon size={28} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-ink mb-3">{item.title}</h3>
                <p className="text-sub text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-r from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center relative z-10">
          <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            WhatsApp us your requirements - we'll recommend the right solution within minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/254701039256"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1fb85b] text-white font-display font-bold px-8 py-4 rounded-2xl transition-all hover:scale-110 text-lg shadow-xl"
            >
              <MessageCircle size={24} /> Chat on WhatsApp
            </a>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-display font-bold px-8 py-4 rounded-2xl transition-all border border-white/30"
            >
              See Our Work <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
