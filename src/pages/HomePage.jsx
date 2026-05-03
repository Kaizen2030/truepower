import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { getProducts, getSettings } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getProducts({ limit: 16 })
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    getSettings().then(setSettings).catch(() => {})
  }, [])

  const whatsappNum = settings?.whatsapp_number || '254701039256'

  return (
    <main className="pt-[68px] min-h-screen bg-white">
      <section className="border-b border-border">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-brand-500 text-xs font-display font-bold uppercase tracking-[0.24em] mb-3">
                TruePower Store
              </p>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink leading-tight">
                Shop the best hot water solutions.
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                <ShoppingBag size={18} /> View All Products
              </Link>
              <a
                href={`https://wa.me/${whatsappNum}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="rounded-3xl bg-muted animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <p className="text-sub text-sm">Showing {products.length} item{products.length === 1 ? '' : 's'}</p>
                <h2 className="font-display font-bold text-2xl text-ink">Featured products</h2>
              </div>
              <Link to="/shop" className="text-sm font-semibold text-brand-500 hover:text-brand-600">
                View full shop
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="border-t border-border py-10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="rounded-3xl bg-brand-50 p-8 md:p-12 text-center">
            <p className="text-brand-500 text-xs font-display font-bold uppercase tracking-[0.24em] mb-3">
              Need help choosing?
            </p>
            <h3 className="font-display font-bold text-3xl text-ink mb-4">
              Fast support via WhatsApp
            </h3>
            <p className="text-sub max-w-2xl mx-auto">
              Ask product questions, confirm availability, and arrange pickup or delivery in Nairobi.
            </p>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-6 inline-flex items-center justify-center"
            >
              Chat Now
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

