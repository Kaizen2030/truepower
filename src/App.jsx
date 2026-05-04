import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar     from './components/Navbar'
import Footer     from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'
import CartDrawer from './components/CartDrawer'
import HomePage   from './pages/HomePage'
import ShopPage   from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import WishlistPage from './pages/WishlistPage'
import AboutPage      from './pages/AboutPage'
import PortfolioPage  from './pages/PortfolioPage'
import AdminPage      from './pages/AdminPage'
import LoginPage      from './pages/LoginPage'
import { useCart } from './context/CartContext'
import { useAuth } from './context/AuthContext'

function AdminRoute({ children }) {
  const auth = useAuth()
  if (!auth) return null
  const { user, loading, isAdmin } = auth

  if (loading) return null
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
        <Route path="/admin"         element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/login"   element={<LoginPage />}    />
      </Routes>
      <Footer />
      <WhatsAppFab number="254701039256" />
    </>
  )
}

export default function App() {
  return <AppInner />
}
