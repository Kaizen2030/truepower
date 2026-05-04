import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import TruePowerLogo from './TruePowerLogo'

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-0">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <TruePowerLogo size={20} />
              </div>
              <span className="font-display font-bold text-white text-lg">TruePower</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">Hot water solutions built for Kenyan homes, borehole water, and low-pressure plumbing.</p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="tel:+254701039256" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={14} className="text-brand-400" /> +254 701 039 256
              </a>
              <a href="mailto:info@truepower.co.ke" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} className="text-brand-400" /> info@truepower.co.ke
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-400 shrink-0" /> Nyamakima, Nairobi CBD
              </span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wider">Shop</p>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Wall Heaters', slug: 'standard' },
                { label: 'With Pump', slug: 'pump' },
                { label: 'Shower Heads', slug: 'showerhead' },
                { label: 'Accessories', slug: 'accessory' },
              ].map(item => (
                <li key={item.slug}>
                  <Link to={`/shop?category=${item.slug}`} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wider">Company</p>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { l: 'About', to: '/about' },
                { l: 'Portfolio', to: '/portfolio' },
                { l: 'Shop', to: '/shop' },
                { l: 'Wishlist', to: '/wishlist' },
                { l: 'Admin Login', to: '/admin/login' },
              ].map(i => (
                <li key={i.l}><Link to={i.to} className="hover:text-white transition-colors">{i.l}</Link></li>
              ))}
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div>
            <p className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wider">Order Now</p>
            <p className="text-sm mb-4 leading-relaxed">We handle orders directly on WhatsApp — fast, personal service.</p>
            <a
              href="https://wa.me/254701039256"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb85b] text-white font-display font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} TruePower Kenya. All rights reserved.</p>
          <p className="text-xs text-white/30">Built for Kenyan homes 🇰🇪</p>
        </div>
      </div>
    </footer>
  )
}

