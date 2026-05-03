import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // ── Cart ──
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tp_cart') || '[]') } catch { return [] }
  })
  const [cartOpen, setCartOpen] = useState(false)

  // ── Wishlist ──
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tp_wishlist') || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('tp_cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('tp_wishlist', JSON.stringify(wishlist)) }, [wishlist])

  // ── Cart actions ──
  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty }]
    })
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  // ── WhatsApp checkout message ──
  const buildWhatsAppMessage = useCallback((whatsappNum = '254701039256') => {
    const lines = cart.map(i =>
      `• ${i.name} × ${i.qty} = KSh ${Number(i.price * i.qty).toLocaleString()}`
    )
    const total = `\nTotal: KSh ${Number(cartTotal).toLocaleString()}`
    const text = encodeURIComponent(
      `Hi TruePower! I'd like to order the following:\n\n${lines.join('\n')}${total}\n\nPlease confirm availability and arrange delivery/pickup. Thank you!`
    )
    return `https://wa.me/${whatsappNum}?text=${text}`
  }, [cart, cartTotal])

  // ── Wishlist ──
  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id)
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, product]
    })
  }, [])
  const isWishlisted = useCallback((id) => wishlist.some(p => p.id === id), [wishlist])
  const wishlistCount = wishlist.length

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartCount, cartTotal, cartOpen, setCartOpen, buildWhatsAppMessage,
      wishlist, toggleWishlist, isWishlisted, wishlistCount,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
