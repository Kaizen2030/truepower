import { Link } from 'react-router-dom'
import { Zap, Droplets, Sun, ToggleRight, Wrench, PhoneCall, ArrowRight, Check } from 'lucide-react'
import Seo from '../components/Seo'

const SERVICES = [
  {
    icon: Zap,
    title: 'Water Heater Installation',
    desc: 'Professional installation of electric showers, wall heaters, and pump-assisted systems. We handle all pipe connections and electrical work.',
    features: ['Wall heaters', 'Electric showers', 'Pump-assisted systems', 'Borehole-compatible units'],
  },
  {
    icon: Sun,
    title: 'Solar Solutions',
    desc: 'Supply and installation of solar panels, solar water heaters, and backup systems for homes and businesses across Kenya.',
    features: ['Solar panels', 'Solar water heaters', 'Off-grid systems', 'Battery backup'],
  },
  {
    icon: ToggleRight,
    title: 'Electrical Fittings',
    desc: 'Supply and fitting of quality switches, sockets, bulbs, and lighting for residential and commercial properties.',
    features: ['Switches & sockets', 'LED bulbs & lighting', 'Consumer units', 'Wiring & cabling'],
  },
  {
    icon: Droplets,
    title: 'Water Pump Supply & Setup',
    desc: 'We supply and set up booster pumps and borehole pumps to solve low pressure problems in your home or office.',
    features: ['Booster pumps', 'Borehole pumps', 'Pressure tanks', 'Pipe fittings'],
  },
  {
    icon: Wrench,
    title: 'Repairs & Maintenance',
    desc: 'Fast diagnosis and repair of faulty water heaters, pumps, and electrical systems. We carry spare parts for most brands we stock.',
    features: ['Heater repairs', 'Pump servicing', 'Electrical faults', 'Spare parts supply'],
  },
  {
    icon: PhoneCall,
    title: 'Consultation & Advice',
    desc: 'Not sure what you need? Chat with us on WhatsApp or visit our Nyamakima showroom and we will guide you to the right solution.',
    features: ['Free WhatsApp advice', 'Showroom visits', 'Site assessments', 'Product comparisons'],
  },
]

export default function ServicesPage() {
  return (
    <main className="pt-[68px] min-h-screen bg-white">
      <Seo
        title="Our Services"
        description="TruePower Kenya offers water heater installation, solar solutions, electrical fittings, water pump setup, and repairs across Nairobi."
        path="/services"
      />

      {/* Hero */}
      <div className="border-b border-border bg-muted">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14">
          <p className="text-brand-500 text-xs font-display font-bold uppercase tracking-[0.24em] mb-3">What We Do</p>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink mb-4 leading-tight">
            Our Services
          </h1>
          <p className="text-sub text-lg max-w-2xl">
            From supply to installation to repairs — TruePower handles everything hot water, solar, and electrical for Kenyan homes and businesses.
          </p>
        </div>
      </div>

      {/* Services grid */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(({ icon: Icon, title, desc, features }) => (
            <div key={title} className="rounded-3xl border border-border bg-white p-7 flex flex-col gap-5 hover:border-brand-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                <Icon size={24} className="text-brand-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-ink mb-2">{title}</h2>
                <p className="text-sub text-sm leading-relaxed">{desc}</p>
              </div>
              <ul className="flex flex-col gap-2 mt-auto">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink">
                    <Check size={14} className="text-brand-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border bg-muted">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 text-center">
          <h2 className="font-display font-bold text-3xl text-ink mb-3">Need a service? Talk to us.</h2>
          <p className="text-sub mb-8 max-w-xl mx-auto">Chat with us on WhatsApp for a quick quote, or browse our products online.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/254701039256"
              target="_blank"
              rel="noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <PhoneCall size={18} /> WhatsApp Us
            </a>
            <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
