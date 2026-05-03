import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { getProducts } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

const CATS = [
  { key: 'all', label: 'All Products' },
  { key: 'standard', label: 'Wall Heaters' },
  { key: 'pump', label: 'With Pump' },
  { key: 'showerhead', label: 'Shower Heads' },
  { key: 'accessory', label: 'Accessories' },
]

const SORT_OPTIONS = [
  { key: 'newest',     label: 'Newest First'       },
  { key: 'price-asc',  label: 'Price: Low → High'  },
  { key: 'price-desc', label: 'Price: High → Low'  },
]

export default function ShopPage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState(params.get('search') || '')
  const [sort, setSort]             = useState('newest')

  const category = params.get('category') || 'all'
  const activeSearch = params.get('search') || ''

  const setCategory = (cat) => {
    const p = new URLSearchParams(params)
    cat === 'all' ? p.delete('category') : p.set('category', cat)
    p.delete('search')
    setSearch('')
    setParams(p)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let data = await getProducts({
        category: category === 'all' ? null : category,
        search: activeSearch,
      })
      if (sort === 'price-asc')  data = [...data].sort((a, b) => a.price - b.price)
      if (sort === 'price-desc') data = [...data].sort((a, b) => b.price - a.price)
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [activeSearch, category, sort])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    const p = new URLSearchParams(params)
    search.trim() ? p.set('search', search.trim()) : p.delete('search')
    setParams(p)
  }

  const clearSearch = () => {
    setSearch('')
    const p = new URLSearchParams(params)
    p.delete('search')
    setParams(p)
  }

  const catLabel = CATS.find(c => c.key === category)?.label || 'All Products'

  return (
    <main className="pt-[68px] min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-border bg-muted">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10">
          <h1 className="font-display font-extrabold text-4xl text-ink mb-1">{catLabel}</h1>
          <p className="text-sub text-sm">
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
            {activeSearch && <> for "<span className="text-ink font-medium">{activeSearch}</span>"</>}
          </p>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input pl-10 pr-10"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-sub hover:text-ink">
                <X size={14} />
              </button>
            )}
          </form>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input w-auto bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8 pb-2 border-b border-border">
          {CATS.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-4 py-2 rounded-full font-display font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                category === cat.key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-muted border border-border text-sub hover:text-ink hover:border-brand-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="font-display font-bold text-xl text-ink mb-2">No products found</h3>
            <p className="text-sub text-sm">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </main>
  )
}

