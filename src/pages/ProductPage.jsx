import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, MessageCircle, ChevronLeft, ChevronRight, Zap, Check, ShoppingBag, ArrowLeft } from 'lucide-react'
import { getProduct, getProducts } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import Seo, { SITE_URL, DEFAULT_IMAGE } from '../components/Seo'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated]   = useState([])
  const [imgIdx, setImgIdx]     = useState(0)
  const [qty, setQty]           = useState(1)
  const [loading, setLoading]   = useState(true)
  const [added, setAdded]       = useState(false)
  const { addToCart, toggleWishlist, isWishlisted } = useCart()

  useEffect(() => {
    setLoading(true)
    setImgIdx(0)
    setQty(1)
    setAdded(false)
    getProduct(id).then(p => {
      setProduct(p)
      setLoading(false)
      if (p?.cat) {
        getProducts({ category: p.cat, limit: 5 })
          .then(r => setRelated(r.filter(x => x.id !== id)))
          .catch((error) => {
            console.error('Failed to load related products:', error)
          })
      }
    }).catch((error) => {
      console.error('Failed to load product:', error)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <main className="pt-[68px] min-h-screen bg-white">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="flex flex-col gap-4 pt-4">
            <div className="h-5 bg-muted rounded-full w-24" />
            <div className="h-10 bg-muted rounded-xl w-3/4" />
            <div className="h-8 bg-muted rounded-xl w-1/3 mt-2" />
            <div className="h-24 bg-muted rounded-xl mt-2" />
          </div>
        </div>
      </div>
    </main>
  )

  if (!product) return (
    <main className="pt-[68px] min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="font-display font-bold text-2xl text-ink mb-2">Product not found</h2>
        <Link to="/shop" className="btn-primary mt-4">Back to Shop</Link>
      </div>
    </main>
  )

  const images   = Array.isArray(product.images) ? product.images : (product.images ? [product.images] : [])
  const specs    = product.specs    || {}
  const features = product.features || []
  const wishlisted = isWishlisted(product.id)
  const productImage = images[0] || DEFAULT_IMAGE
  const productDescription = product.description || `Buy ${product.name} from TruePower Kenya.`
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images.length ? images : [DEFAULT_IMAGE],
    description: productDescription,
    sku: product.model || String(product.id),
    brand: {
      '@type': 'Brand',
      name: 'TruePower Kenya',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: String(product.price),
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/product/${product.id}`,
    },
  }

  const waMessage = encodeURIComponent(
    `Hi TruePower! I want to order *${product.name}* × ${qty} = KSh ${Number(product.price * qty).toLocaleString()}. Please assist.`
  )

  const handleAddToCart = () => {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <main className="pt-[68px] min-h-screen bg-white">
      <Seo
        title={product.name}
        description={productDescription}
        path={`/product/${product.id}`}
        image={productImage}
        type="product"
        jsonLd={productJsonLd}
      />
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-sub mb-8">
          <Link to="/shop" className="hover:text-brand-500 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Shop
          </Link>
          <span>/</span>
          <span className="text-ink truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden mb-3 border border-border">
              {images.length > 0 ? (
                <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-50">
                  <Zap size={64} className="text-brand-200" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow flex items-center justify-center text-ink hover:bg-white transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow flex items-center justify-center text-ink hover:bg-white transition-all">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {product.badge && (
                <span className="absolute top-4 left-4 badge-green">{product.badge}</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${i === imgIdx ? 'border-brand-500' : 'border-border hover:border-brand-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="badge mb-3 w-fit capitalize">{product.category?.replace('-', ' ')}</div>
            <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-2 leading-tight">{product.name}</h1>
            {product.model && <p className="text-faint text-sm mb-5">Model: {product.model}</p>}

            <div className="flex items-baseline gap-3 mb-1">
              <p className="font-display font-extrabold text-4xl text-ink">KSh {Number(product.price).toLocaleString()}</p>
              {product.original_price && (
                <p className="text-faint text-lg line-through">KSh {Number(product.original_price).toLocaleString()}</p>
              )}
            </div>
            <div className="mb-6" />

            {product.description && (
              <p className="text-sub leading-relaxed mb-8">{product.description}</p>
            )}

            {features.length > 0 && (
              <ul className="flex flex-col gap-2 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink">
                    <Check size={14} className="text-brand-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            )}

            {/* Qty selector */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1 border border-border rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-sub hover:text-ink transition-all text-lg font-bold">
                  −
                </button>
                <span className="w-10 text-center font-display font-bold text-ink">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-sub hover:text-ink transition-all text-lg font-bold">
                  +
                </button>
              </div>
              <span className="text-sub text-sm">
                Total: <strong className="text-ink font-display">KSh {Number(product.price * qty).toLocaleString()}</strong>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 font-display font-bold px-6 py-4 rounded-2xl transition-all text-base ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-500 hover:bg-brand-600 text-white hover:scale-[1.01] active:scale-95'
                }`}
              >
                {added ? <><Check size={18} /> Added to Cart!</> : <><ShoppingBag size={18} /> Add to Cart</>}
              </button>
              <a
                href={`https://wa.me/254701039256?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb85b] text-white font-display font-bold px-6 py-4 rounded-2xl transition-all text-base hover:scale-[1.01] active:scale-95"
              >
                <MessageCircle size={18} /> Order via WhatsApp
              </a>
            </div>

            <div className="flex gap-2 mb-8">
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-display font-semibold text-sm transition-all ${
                  wishlisted ? 'bg-brand-50 border-brand-200 text-brand-500' : 'border-border text-sub hover:border-brand-200 hover:text-brand-500'
                }`}
              >
                <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
                {wishlisted ? 'Saved' : 'Save to Wishlist'}
              </button>
            </div>

            {/* Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="border-t border-border pt-6">
                <h3 className="font-display font-bold text-xs text-sub uppercase tracking-widest mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} className="bg-muted rounded-xl px-4 py-3 border border-border">
                      <p className="text-faint text-[10px] uppercase tracking-wider font-display mb-1">{k}</p>
                      <p className="text-ink text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery note */}
            <div className="mt-6 bg-brand-50 border border-brand-100 rounded-2xl p-4 flex gap-3">
              <Zap size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <p className="text-sub text-sm leading-relaxed">
                <span className="text-brand-500 font-semibold">Same-day pickup</span> available in Nairobi CBD (Nyamakima). WhatsApp us to confirm stock before visiting.
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-border pt-12">
            <h2 className="font-display font-bold text-2xl text-ink mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

