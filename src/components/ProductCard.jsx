import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Zap } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CAT_LABELS = {
  'standard': 'Wall Heater',
  'pump': 'With Pump',
  'showerhead': 'Shower Head',
  'accessory': 'Accessory',
  'bulbs_lighting': 'Bulbs & Lighting',
  'switches_sockets': 'Switches & Sockets',
  'solar_solutions': 'Solar Solution',
  'water_pumps': 'Water Pump',
}

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const wishlisted = isWishlisted(product.id)
  const img = Array.isArray(product.images) ? product.images[0] : product.images

  return (
    <div className="card group flex flex-col w-full">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden bg-muted" style={{ aspectRatio: '3 / 4' }}>
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-50">
            <Zap size={40} className="text-brand-200" />
          </div>
        )}

        {/* Primary badge: top-left, visible on all sizes (keeps 'bestseller', 'new', 'sale' visible) */}
        {product.badge && (
          <span className="absolute top-3 left-3 badge-green text-[10px]">{product.badge}</span>
        )}

        {/* Category label: top-right (to the left of wishlist), shown on md+ to avoid covering mobile images */}
        <span className="absolute top-3 right-12 hidden md:inline-block bg-white/80 backdrop-blur-sm text-sub text-[10px] font-display font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {product.catLabel || CAT_LABELS[product.cat] || product.cat}
        </span>

        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); toggleWishlist(product) }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-sm ${
            wishlisted
              ? 'bg-brand-500 text-white'
              : 'bg-white/80 text-sub hover:text-brand-500'
          }`}
        >
          <Heart size={13} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {/* Category badge for small screens: placed below image (primary badge already overlays image) */}
      <div className="p-4 pt-3 md:hidden flex gap-2 items-center flex-wrap">
        <span className="bg-white text-sub text-[11px] font-display font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-border">
          {product.catLabel || CAT_LABELS[product.cat] || product.cat}
        </span>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="mb-0.5 group/link">
          <h3 className="font-display font-semibold text-base leading-snug text-ink group-hover/link:text-brand-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.model && (
          <p className="text-faint text-xs mb-1.5">{product.model}</p>
        )}

        <div className="flex flex-col mt-auto pt-4">
          <div>
            <p className="font-display font-bold text-xl text-ink leading-tight">
              KSh {Number(product.price).toLocaleString()}
            </p>
            {product.original_price && (
              <p className="text-faint text-xs line-through">
                KSh {Number(product.original_price).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4">
            <Link
              to={`/product/${product.id}`}
              className="flex-1 text-center text-sm font-semibold h-9 leading-9 px-3 rounded-full border border-border text-sub hover:text-brand-500 hover:border-brand-200 transition-all"
            >
              View
            </Link>

            <button
              onClick={() => addToCart(product)}
              aria-label="Add to cart"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
