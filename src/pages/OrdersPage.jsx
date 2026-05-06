import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'
import { getOrdersByUser } from '../lib/supabase'

export default function OrdersPage() {
  const auth = useAuth()
  const { user } = auth ?? {}
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return setLoading(false)
    getOrdersByUser(user.id).then(list => { setOrders(list || []); setLoading(false) }).catch(() => setLoading(false))
  }, [user])

  if (loading) return <div className="pt-[68px] min-h-screen flex items-center justify-center">Loading…</div>

  return (
    <main className="pt-[120px] min-h-screen bg-white">
      <Seo title="My Orders" description="Your order history" path="/orders" />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="font-display font-extrabold text-2xl mb-4">Orders</h1>
        {(!orders || orders.length === 0) ? (
          <div className="bg-muted p-6 rounded">You have no orders yet. <a href="/shop" className="text-brand-500">Start shopping</a>.</div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="p-4 border border-border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-sub">Order #{o.id}</div>
                  <div className="text-sm font-semibold">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm text-sub mb-2">Status: <span className="font-medium">{o.status || 'pending'}</span></div>
                <div className="text-sm">Total: KSh {Number(o.total || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
