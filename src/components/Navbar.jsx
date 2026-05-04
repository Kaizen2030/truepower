import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Heart, Search, Menu, X, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import TruePowerLogo from './TruePowerLogo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
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
    setSearchOpen(false)
  }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/about', label: 'About' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-white border-b border-border'
      }`}>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-12 h-12 flex items-center justify-center">
                <TruePowerLogo size={48} />
              </div>
              <span className="font-display font-bold text-[18px] tracking-tight text-ink">
                True<span className="text-brand-500">Power</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `font-body text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
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
                      `font-body text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive ? 'text-brand-500 bg-brand-50' : 'text-faint hover:text-ink hover:bg-muted'
                      }`
                    }>
                      Admin
                    </NavLink>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="font-body text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sub hover:text-ink hover:bg-muted"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink to="/admin/login" className={({ isActive }) =>
                  `font-body text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive ? 'text-brand-500 bg-brand-50' : 'text-sub hover:text-ink hover:bg-muted'
                  }`
                }>
                  Login
                </NavLink>
              )}
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setSearchOpen(s => !s)}
                className="p-2.5 text-sub hover:text-ink hover:bg-muted rounded-lg transition-all"
              >
                <Search size={18} />
              </button>

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

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border bg-white">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-3">
              <form onSubmit={handleSearch}>
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="input"
                />
              </form>
            </div>
          </div>
        )}

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
      </nav>
    </>
  )
}

