import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { getOrderById } from '../lib/supabase'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return setLoading(false)
    getOrderById(id).then(o => { setOrder(o); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="pt-[68px] min-h-screen flex items-center justify-center">Loading…</div>

  if (!order) return (
    <main className="pt-[68px] min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-6">Order not found. <Link to="/orders" className="text-brand-500">Back to orders</Link></div>
    </main>
  )

  // assume order.items is JSON array of { id, name, qty, price, image }
  let items = []
  try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []) } catch { items = order.items || [] }

  return (
    <main className="pt-[120px] min-h-screen bg-white">
      <Seo title={`Order #${order.id}`} description={`Details for order ${order.id}`} path={`/orders/${order.id}`} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="font-display font-extrabold text-2xl mb-4">Order #{order.id}</h1>
        <div className="mb-4 text-sm text-sub">Placed: {new Date(order.created_at).toLocaleString()}</div>
        <div className="mb-6">Status: <span className="font-medium">{order.status}</span></div>

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center gap-4 border border-border p-3 rounded">
              {it.image ? <img src={it.image} alt="" className="w-16 h-16 object-cover rounded" /> : <div className="w-16 h-16 bg-muted rounded" />}
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-sub">Qty: {it.qty} · KSh {Number(it.price || 0).toLocaleString()}</div>
              </div>
              <div className="font-semibold">KSh {Number((it.price||0) * (it.qty||1)).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-right font-bold">Total: KSh {Number(order.total || 0).toLocaleString()}</div>
      </div>
    </main>
  )
}
