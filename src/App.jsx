import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar     from './components/Navbar'
import Footer     from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'
import CartDrawer from './components/CartDrawer'
import HomePage   from './pages/HomePage'
import ShopPage   from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import WishlistPage from './pages/WishlistPage'
import AboutPage      from './pages/AboutPage'
import ServicesPage   from './pages/ServicesPage'
import PortfolioPage  from './pages/PortfolioPage'
import BlogPage       from './pages/BlogPage'
import BlogPostPage   from './pages/BlogPostPage'
import AccountPage    from './pages/AccountPage'
import OrdersPage     from './pages/OrdersPage'
import OrderDetail    from './pages/OrderDetail'
import AdminPage      from './pages/AdminPage'
import LoginPage      from './pages/LoginPage'
import { useCart } from './context/CartContext'
import { useAuth } from './context/AuthContext'

function AdminRoute({ children }) {
  const auth = useAuth()
  if (!auth) return null
  const { user, loading, isAdmin } = auth

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-base text-sub">Checking admin access…</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppInner() {
  const { cartOpen } = useCart()
  return (
    <>
      <Navbar />
      <CartDrawer whatsappNum="254701039256" />
      <Routes>
        <Route path="/"              element={<HomePage />}     />
        <Route path="/shop"          element={<ShopPage />}     />
        <Route path="/portfolio"     element={<PortfolioPage />} />
        <Route path="/product/:id"   element={<ProductPage />}  />
        <Route path="/wishlist"      element={<WishlistPage />} />
        <Route path="/about"         element={<AboutPage />}    />
        <Route path="/services"      element={<ServicesPage />} />
        <Route path="/blog"          element={<BlogPage />} />
        <Route path="/blog/:slug"    element={<BlogPostPage />} />
        <Route path="/account"       element={<AccountPage />} />
        <Route path="/orders"        element={<OrdersPage />} />
        <Route path="/orders/:id"    element={<OrderDetail />} />
        <Route path="/admin"         element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/blogs"   element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/login"   element={<LoginPage />}    />
      </Routes>
      <Footer />
      <WhatsAppFab number="254701039256" />
    </>
  )
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, [pathname])

  return <AppInner />
}
