import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Heart, Search, Menu, X, ShoppingBag } from 'lucide-react'
import { getProducts } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import TruePowerLogo from './TruePowerLogo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [catSuggestions, setCatSuggestions] = useState([])
  const [suggLoading, setSuggLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  let suggTimer = null
  const { wishlistCount, cartCount, setCartOpen } = useCart()
  const auth = useAuth()
  const { user, isAdmin, signOut = async () => {} } = auth ?? {}
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setOpen(false)
      navigate('/')
    }
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  const fetchSuggestions = (q) => {
    if (suggTimer) clearTimeout(suggTimer)
    if (!q || q.length < 2) {
      setSuggestions([])
      setCatSuggestions([])
      setSuggLoading(false)
      return
    }
    setSuggLoading(true)
    suggTimer = setTimeout(async () => {
      try {
        const prods = await getProducts({ search: q, limit: 6 })
        setSuggestions(prods || [])
      } catch (err) {
        setSuggestions([])
      }
      // categories match
      const catMatches = categories.filter(c => c.label.toLowerCase().includes(q.toLowerCase()))
      setCatSuggestions(catMatches)
      setSuggLoading(false)
    }, 220)
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About' },
  ]

  const categories = [
    { key: 'water_heaters',    label: 'Water Heaters' },
    { key: 'bulbs_lighting',   label: 'Bulbs & Lighting' },
    { key: 'switches_sockets', label: 'Switches & Sockets' },
    { key: 'solar_solutions',  label: 'Solar Solutions' },
    { key: 'water_pumps',      label: 'Water Pumps' },
  ]

  return (
    <>
      {/* Announcement bar */}
      <div className="fixed top-0 left-0 right-0 z-[101] bg-blue-600 text-white text-xs font-display font-semibold text-center py-2 px-4">
        📞 +254 701 039 256 &nbsp;·&nbsp; Nyamakima, Nairobi CBD &nbsp;·&nbsp; Mon–Sat 8am–6pm
      </div>
      <nav className={`fixed top-7 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-white border-b border-border'
      }`}>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center gap-6 h-16 lg:h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-10 h-10 flex items-center justify-center">
                <TruePowerLogo size={40} />
              </div>
              <span className="font-display font-bold text-[18px] tracking-tight text-ink">
                True<span className="text-brand-500">Power</span>
              </span>
            </Link>

            {/* Desktop Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `font-body text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-brand-500 bg-brand-50'
                        : 'text-sub hover:text-ink hover:bg-muted'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  {isAdmin && (
                    <NavLink to="/admin" className={({ isActive }) =>
                      `font-body text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive ? 'text-brand-500 bg-brand-50' : 'text-faint hover:text-ink hover:bg-muted'
                      }`
                    }>
                      Admin
                    </NavLink>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="font-body text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 text-sub hover:text-ink hover:bg-muted"
                  >
                    Logout
                  </button>
                </>
              ) : null}
            </div>

            {/* Search bar — center/right like hiii-style */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-auto relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub pointer-events-none" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value); setShowSuggestions(true) }}
                onFocus={() => { if (query.length >= 2) { fetchSuggestions(query); setShowSuggestions(true) } }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                placeholder="Search products"
                className="w-full border border-border rounded-full py-2.5 pl-10 pr-4 text-sm bg-muted placeholder:text-sub focus:outline-none focus:border-brand-300 focus:bg-white transition-all"
              />

              {/* Suggestions dropdown */}
              {showSuggestions && ( (suggestions.length > 0) || (catSuggestions.length > 0) || suggLoading) && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-lg z-30 max-h-72 overflow-auto">
                  <div className="py-2">
                    {suggLoading && <div className="px-4 py-2 text-sub text-sm">Searching...</div>}
                    {catSuggestions.map(cat => (
                      <div key={cat.key} className="px-4 py-2 hover:bg-muted cursor-pointer" onMouseDown={() => { navigate(`/shop?category=${cat.key}`); setQuery(''); setShowSuggestions(false) }}>
                        <div className="text-sm font-semibold">{cat.label}</div>
                        <div className="text-xs text-sub">Category</div>
                      </div>
                    ))}
                    {suggestions.map(p => (
                      <div key={p.id} className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-3" onMouseDown={() => { navigate(`/product/${p.id}`); setQuery(''); setShowSuggestions(false) }}>
                        {p.image_url ? <img src={p.image_url} alt="" className="w-10 h-10 rounded-md object-cover" /> : <div className="w-10 h-10 bg-muted rounded-md" />}
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{p.name}</div>
                          <div className="text-xs text-sub truncate">KSh {Number(p.price || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                    {(!suggLoading && suggestions.length === 0 && catSuggestions.length === 0) && (
                      <div className="px-4 py-2 text-sub text-sm">No results</div>
                    )}
                  </div>
                </div>
              )}
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Desktop Login button placed next to wishlist/cart */}
              {!user && (
                <NavLink to="/admin/login" className="hidden md:inline-flex btn-primary ml-2">
                  Login
                </NavLink>
              )}
              <Link
                to="/wishlist"
                className="p-2.5 text-sub hover:text-ink hover:bg-muted rounded-lg transition-all relative"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-[14px] h-[14px] bg-brand-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white leading-none">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="p-2.5 text-sub hover:text-ink hover:bg-muted rounded-lg transition-all relative"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-[14px] h-[14px] bg-brand-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setOpen(s => !s)}
                className="md:hidden p-2.5 text-sub hover:text-ink hover:bg-muted rounded-lg transition-all ml-1"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* old dropdown search removed; search is now in navbar */}

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="px-4 py-5 flex flex-col gap-1">
              {links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-display font-semibold text-base px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'text-brand-500 bg-brand-50' : 'text-ink'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="pt-3 border-t border-border mt-2">
                <p className="px-4 text-sm font-medium text-sub">Categories</p>
                <div className="flex gap-2 px-4 pt-2 overflow-x-auto">
                  {categories.map(cat => (
                    <Link key={cat.key} to={`/shop?category=${cat.key}`} onClick={() => setOpen(false)} className="shrink-0 text-sm font-display font-semibold px-3 py-2 rounded-full bg-muted border border-border">
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
              {user ? (
                <>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="font-display font-semibold text-base px-4 py-3 rounded-xl text-sub"
                    >
                      Admin
                    </NavLink>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="font-display font-semibold text-base px-4 py-3 rounded-xl text-sub text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/admin/login"
                  onClick={() => setOpen(false)}
                  className="font-display font-semibold text-base px-4 py-3 rounded-xl text-sub"
                >
                  Login
                </NavLink>
              )}
              <div className="pt-3 border-t border-border mt-2">
                <a
                  href="https://wa.me/254701039256"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Category bar — like hiii-style */}
        <div className="hidden md:block border-t border-border bg-white overflow-x-auto">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="flex items-center gap-8 h-10">
              {categories.map(cat => (
                <Link
                  key={cat.key}
                  to={`/shop?category=${cat.key}`}
                  className="shrink-0 text-xs font-display font-bold uppercase tracking-wider text-sub hover:text-ink transition-colors whitespace-nowrap"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

