import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Zap } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CAT_LABELS = {
  'standard': 'Wall Heater',
  'pump': 'With Pump',
  'showerhead': 'Shower Head',
  'accessory': 'Accessory',
}

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const wishlisted = isWishlisted(product.id)
  const img = Array.isArray(product.images) ? product.images[0] : product.images

  return (
    <div className="card group flex flex-col w-full">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden bg-muted" style={{ aspectRatio: '5 / 4' }}>
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

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="badge-green text-[10px]">{product.badge}</span>
          )}
          <span className="bg-white/80 backdrop-blur-sm text-sub text-[10px] font-display font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {product.catLabel || CAT_LABELS[product.cat] || product.cat}
          </span>
        </div>

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

          <div className="flex gap-2 mt-4">
            <Link
              to={`/product/${product.id}`}
              className="flex-1 text-center text-sm font-semibold py-3 rounded-full border border-border text-sub hover:text-brand-500 hover:border-brand-200 transition-all"
            >
              View
            </Link>
            <button
              onClick={() => addToCart(product)}
              className="flex-1 text-center text-xs font-semibold py-2 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
