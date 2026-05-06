import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getSettings } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import Seo, { SITE_URL, DEFAULT_IMAGE } from '../components/Seo'

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
      .catch((error) => {
        console.error('Failed to load products:', error)
        setLoading(false)
      })

    getSettings()
      .then(setSettings)
      .catch((error) => {
        console.error('Failed to load settings:', error)
      })
  }, [])

  const whatsappNum = settings?.whatsapp_number || '254701039256'
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'TruePower Kenya',
    url: SITE_URL,
    image: DEFAULT_IMAGE,
    description: 'Water heaters, pumps, solar solutions, lighting and electrical gear for Kenyan homes.',
    areaServed: 'Kenya',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    sameAs: [`https://wa.me/${whatsappNum}`],
  }

  

  return (
    <main className="pt-[68px] min-h-screen bg-white">
      <Seo
        title="Water Heaters, Solar & Electrical Solutions"
        description="Shop water heaters, pumps, solar solutions, lighting and electrical gear for Kenyan homes. Get expert recommendations for borehole water and low-pressure setups."
        path="/"
        jsonLd={homeJsonLd}
      />
      {/* Hero and category tiles removed per request */}

      <section className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-6">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="rounded-3xl bg-muted animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                  <p className="text-sub text-sm uppercase tracking-wider text-xs font-semibold">All Products</p>
                  <h2 className="font-display font-bold text-2xl text-ink">Featured products</h2>
              </div>
              <Link to="/shop" className="text-sm font-semibold text-brand-500 hover:text-brand-600">
                View full shop
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
        </div>
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
