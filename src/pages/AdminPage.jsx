import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit2, Save, X, Upload, LogOut, Settings, Package, Star, Image, Users, GripVertical, Sparkles } from 'lucide-react'
import {
  getProducts, upsertProduct, deleteProduct,
  getSettings, saveSettings, saveProductOrder,
  getTestimonials, upsertTestimonial, deleteTestimonial,
  getAllPageContent, uploadImage, getPageSectionSchemas,
  getGalleryImages, promoteUserToAdmin, demoteAdmin, supabase
} from '../lib/supabase'
import PageContentEditor from '../components/PageContentEditor'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'

// Water Heaters group + new categories
const CATS = [
  { value: 'standard',         label: 'Wall Heaters',       group: 'Water Heaters' },
  { value: 'pump',             label: 'With Pump',          group: 'Water Heaters' },
  { value: 'showerhead',       label: 'Shower Heads',       group: 'Water Heaters' },
  { value: 'accessory',        label: 'Accessories',        group: 'Water Heaters' },
  { value: 'bulbs_lighting',   label: 'Bulbs & Lighting',   group: 'Electrical' },
  { value: 'switches_sockets', label: 'Switches & Sockets', group: 'Electrical' },
  { value: 'solar_solutions',  label: 'Solar Solutions',    group: 'Solar' },
  { value: 'water_pumps',      label: 'Water Pumps',        group: 'Water' },
]
// derive category groups from CATS
const GROUPS = Array.from(new Set(CATS.map(c => c.group)))
const TABS = [
  { key: 'products', label: 'Products', icon: <Package size={16} /> },
  { key: 'services', label: 'Services', icon: <Sparkles size={16} /> },
  { key: 'testimonials', label: 'Testimonials', icon: <Star size={16} /> },
  { key: 'gallery', label: 'Gallery', icon: <Image size={16} /> },
  { key: 'pageContent', label: 'Pages', icon: <Settings size={16} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  { key: 'admins', label: 'Admins', icon: <Users size={16} /> },
]

const ANIMATION_STYLES = [
  { value: 'float', label: 'Floating Motion - gentle up/down' },
  { value: 'pulse', label: 'Soft Pulse - subtle breathing effect' },
  { value: 'glow', label: 'Glow Effect - light shadow on hover' },
  { value: 'slide-up', label: 'Slide Up - lifts on hover' },
  { value: 'scale', label: 'Scale - grows slightly on hover' },
  { value: 'rotate', label: 'Subtle Rotation - turns on hover' },
  { value: 'shimmer', label: 'Shimmer Border - light sweep effect' },
]

const ICON_OPTIONS = [
  { value: 'Zap', label: '⚡ Zap - Lightning (Water Heater)' },
  { value: 'Droplets', label: '💧 Droplets - Water (Pumps)' },
  { value: 'Sun', label: '☀️ Sun - Solar' },
  { value: 'ToggleRight', label: '🔘 ToggleRight - Electrical' },
  { value: 'Wrench', label: '🔧 Wrench - Repairs' },
  { value: 'PhoneCall', label: '📞 PhoneCall - Consultation' },
  { value: 'Sparkles', label: '✨ Sparkles - Premium' },
]

const EMPTY_PRODUCT = {
  name: '',
  model: '',
  cat: 'standard',
  catLabel: 'Wall Heaters',
  group: 'Water Heaters',
  price: '',
  desc: '',
  badge: '',
  images: [],
  features: [],
  specs: {}
}

function moveProduct(products, draggedId, targetId) {
  const fromIndex = products.findIndex(product => product.id === draggedId)
  const toIndex = products.findIndex(product => product.id === targetId)

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return products

  const nextProducts = [...products]
  const [dragged] = nextProducts.splice(fromIndex, 1)
  nextProducts.splice(toIndex, 0, dragged)
  return nextProducts
}

export default function AdminPage() {
  const auth = useAuth()
  const { user, loading: authLoading, isAdmin, signOut: authSignOut } = auth ?? { user: null, loading: true, isAdmin: false, signOut: async () => {} }
  const navigate = useNavigate()
  const [tab, setTab] = useState('products')

  // Products
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [featureInput, setFeatureInput] = useState('')
  const [specKey, setSpecKey] = useState('')
  const [specVal, setSpecVal] = useState('')
  const [draggedProductId, setDraggedProductId] = useState(null)
  const [dragOverProductId, setDragOverProductId] = useState(null)
  const [orderSaving, setOrderSaving] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')

  // Testimonials
  const [testimonials, setTestimonials] = useState([])
  const [tForm, setTForm] = useState({ name: '', location: '', text: '' })

  // Gallery
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'installation' })
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryImageUrl, setGalleryImageUrl] = useState('')
  const galleryFileRef = useRef()

  // Settings
  const [settings, setSettings] = useState({
    whatsapp_number: '254701039256',
    hero_title: 'Hot Water.|Every Morning.',
    hero_subtitle: '',
    stat_customers: '500+',
    stat_rating: '4.9/5',
  })

  // Page content CMS
  const [pageContent, setPageContent] = useState({ about: null, portfolio: null })
  // Services
  const [services, setServices] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [serviceSaving, setServiceSaving] = useState(false)
  const [serviceImageFile, setServiceImageFile] = useState(null)
  const [serviceImagePreview, setServiceImagePreview] = useState('')
  const serviceFileRef = useRef()
  const [draggedServiceId, setDraggedServiceId] = useState(null)
  const [dragOverServiceId, setDragOverServiceId] = useState(null)
  const [admins, setAdmins] = useState([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [adminActionLoading, setAdminActionLoading] = useState(false)

  const fileRef = useRef()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login')
    }
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!isAdmin) return
    loadProducts()
    loadServices()
    loadAdmins()
    getTestimonials().then(setTestimonials).catch(() => {})
    getGalleryImages().then(setGalleryImages).catch(() => {})
    getSettings().then(s => s && setSettings(prev => ({ ...prev, ...s }))).catch(() => {})
    loadPageContent()
  }, [isAdmin])

  const loadProducts = () => getProducts().then(setProducts).catch(() => {})
  const loadServices = async () => {
    try {
      const { data, error } = await supabase.from('services').select('*').order('order_index', { ascending: true })
      if (error) throw error
      setServices(data || [])
    } catch (e) {
      console.error('loadServices error:', e)
      setServices([])
    }
  }
  const loadAdmins = async () => {
    setAdminsLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_admin_users')
      if (error) throw error
      setAdmins(data || [])
    } catch (e) {
      console.error('loadAdmins error:', e)
      setAdmins([])
    } finally {
      setAdminsLoading(false)
    }
  }

  const handlePromoteAdmin = async () => {
    if (!newAdminEmail.trim()) return alert('Enter an email to promote.')
    setAdminActionLoading(true)
    setAdminMessage('')
    try {
      await promoteUserToAdmin(newAdminEmail.trim())
      setAdminMessage(`${newAdminEmail.trim()} is now an admin.`)
      setNewAdminEmail('')
      loadAdmins()
    } catch (err) {
      alert(err.message || 'Unable to add admin. Make sure the user has signed up.')
    } finally {
      setAdminActionLoading(false)
    }
  }

  const handleDemoteAdmin = async (id) => {
    if (!confirm('Remove admin access for this user?')) return
    setAdminActionLoading(true)
    try {
      await demoteAdmin(id)
      setAdminMessage('Admin access removed.')
      loadAdmins()
    } catch (err) {
      alert(err.message || 'Unable to remove admin.')
    } finally {
      setAdminActionLoading(false)
    }
  }

  // ── Product CRUD ──────────────────────────────────────────
  const startNew = () => setEditing({ ...EMPTY_PRODUCT })
  const startEdit = (p) => {
    const found = CATS.find(c => c.value === p.cat)
    const group = found?.group || 'Water Heaters'
    setEditing({ ...p, group, features: p.features || [], specs: p.specs || {}, images: p.images || [] })
  }

  const handleSave = async () => {
    if (!editing.name || !editing.price) return alert('Name and price are required.')
    setSaving(true)
    try {
      await upsertProduct({ ...editing, price: Number(editing.price) })
      setEditing(null)
      loadProducts()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await deleteProduct(id)
    const nextProducts = products.filter(product => product.id !== id)
    setProducts(nextProducts)
    await saveProductOrder(nextProducts.map(product => product.id))
    loadProducts()
  }

  const persistProductOrder = async (nextProducts) => {
    setProducts(nextProducts)
    setOrderSaving(true)
    setOrderMessage('Saving order...')

    try {
      await saveProductOrder(nextProducts.map(product => product.id))
      setOrderMessage('Order saved')
    } catch (error) {
      console.error('Failed to save product order:', error)
      setOrderMessage('Could not save order')
      loadProducts()
    } finally {
      setOrderSaving(false)
      window.setTimeout(() => {
        setOrderMessage(current => (current === 'Order saved' ? '' : current))
      }, 1800)
    }
  }

  const handleProductDrop = async (targetId) => {
    if (!draggedProductId || draggedProductId === targetId) {
      setDraggedProductId(null)
      setDragOverProductId(null)
      return
    }

    const nextProducts = moveProduct(products, draggedProductId, targetId)
    setDraggedProductId(null)
    setDragOverProductId(null)
    await persistProductOrder(nextProducts)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSaving(true)
    try {
      const url = await uploadImage(file)
      setEditing(prev => ({ ...prev, images: [...(prev.images || []), url] }))
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  // ── Services CRUD ──────────────────────────────────────────
  const startNewService = () => {
    setEditingService({
      id: null,
      title: '',
      description: '',
      icon_name: 'Zap',
      features: [],
      image_url: null,
      animation_style: 'float',
      order_index: services.length || 0,
      is_active: true,
      badge_text: '',
      cta_text: 'Learn More'
    })
    setServiceImagePreview('')
    setServiceImageFile(null)
  }

  const startEditService = (s) => {
    setEditingService({ ...s, features: s.features || [] })
    setServiceImagePreview(s.image_url || '')
    setServiceImageFile(null)
  }

  const handleServiceImageSelect = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setServiceImageFile(file)
    setServiceImagePreview(URL.createObjectURL(file))
  }

  const uploadServiceImage = async () => {
    if (!serviceImageFile) return null
    const fileExt = serviceImageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${fileName}`
    const { error: uploadError } = await supabase.storage.from('services').upload(filePath, serviceImageFile)
    if (uploadError) throw uploadError
    const { data } = await supabase.storage.from('services').getPublicUrl(filePath)
    return data?.publicUrl || null
  }

  const saveService = async () => {
    if (!editingService?.title) return alert('Service title is required')
    setServiceSaving(true)
    try {
      let imageUrl = editingService.image_url
      if (serviceImageFile) {
        imageUrl = await uploadServiceImage()
      }

      const serviceData = {
        title: editingService.title,
        description: editingService.description,
        icon_name: editingService.icon_name,
        features: editingService.features || [],
        image_url: imageUrl,
        animation_style: editingService.animation_style,
        order_index: editingService.order_index,
        is_active: editingService.is_active,
        badge_text: editingService.badge_text || null,
        cta_text: editingService.cta_text || 'Learn More'
      }

      if (editingService.id) {
        const { error } = await supabase.from('services').update(serviceData).eq('id', editingService.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('services').insert(serviceData)
        if (error) throw error
      }

      setEditingService(null)
      await loadServices()
    } catch (e) {
      alert('Error saving service: ' + (e.message || e))
    } finally {
      setServiceSaving(false)
    }
  }

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (!error) await loadServices()
  }

  const persistServiceOrder = async (nextServices) => {
    setServices(nextServices)
    setOrderSaving(true)
    setOrderMessage('Saving order...')
    try {
      for (let i = 0; i < nextServices.length; i++) {
        const s = nextServices[i]
        const { error } = await supabase.from('services').update({ order_index: i }).eq('id', s.id)
        if (error) throw error
      }
      setOrderMessage('Order saved')
    } catch (error) {
      console.error('Failed to save service order:', error)
      setOrderMessage('Could not save order')
      loadServices()
    } finally {
      setOrderSaving(false)
      window.setTimeout(() => {
        setOrderMessage(current => (current === 'Order saved' ? '' : current))
      }, 1800)
    }
  }

  const handleServiceDrop = async (targetId) => {
    if (!draggedServiceId || draggedServiceId === targetId) {
      setDraggedServiceId(null)
      setDragOverServiceId(null)
      return
    }

    const nextServices = moveProduct(services, draggedServiceId, targetId)
    setDraggedServiceId(null)
    setDragOverServiceId(null)
    await persistServiceOrder(nextServices)
  }

  const addServiceFeature = () => {
    const input = document.getElementById('new-feature-input')
    if (!input || !input.value.trim()) return
    setEditingService(prev => ({ ...prev, features: [...(prev.features || []), input.value.trim()] }))
    input.value = ''
  }

  const removeServiceFeature = (idx) => {
    setEditingService(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))
  }

  const removeImage = (i) => setEditing(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))
  const addFeature = () => {
    if (!featureInput.trim()) return
    setEditing(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }))
    setFeatureInput('')
  }
  const removeFeature = (i) => setEditing(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))
  const addSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return
    setEditing(prev => ({ ...prev, specs: { ...prev.specs, [specKey.trim()]: specVal.trim() } }))
    setSpecKey(''); setSpecVal('')
  }
  const removeSpec = (k) => setEditing(prev => { const s = { ...prev.specs }; delete s[k]; return { ...prev, specs: s } })

  // ── Testimonials ──────────────────────────────────────────
  const saveTestimonial = async () => {
    if (!tForm.name || !tForm.text) return
    await upsertTestimonial(tForm)
    setTForm({ name: '', location: '', text: '' })
    getTestimonials().then(setTestimonials)
  }

  // ── Settings ──────────────────────────────────────────────
  const handleSaveSettings = async () => {
    await saveSettings(settings)
    alert('Settings saved!')
  }

  const loadPageContent = async () => {
    const rows = await getAllPageContent()
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.page_slug]) acc[row.page_slug] = {}
      acc[row.page_slug][row.section_key] = row.content
      return acc
    }, {})
    setPageContent(grouped)
  }

  const handleLogout = async () => {
    try {
      await authSignOut()
    } catch (error) {
      console.error('Admin logout failed:', error)
    } finally {
      navigate('/admin/login')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-border p-10 text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="font-display font-bold text-2xl mb-2">Admin access required</h1>
          <p className="text-sub mb-6">Your account is signed in, but it does not have administrator access.</p>
          <button onClick={() => navigate('/')} className="btn-primary px-6 py-3">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="pt-16 min-h-screen">
      <Seo title="Admin Dashboard" description="Private admin dashboard for TruePower Kenya." path="/admin" noindex />
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl">Admin Dashboard</h1>
            <p className="text-sub text-sm">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost inline-flex items-center gap-2 text-sub hover:text-red-400">
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border mb-8">
          <div className="flex gap-2 min-w-max">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-display font-semibold text-sm transition-colors border-b-2 -mb-[2px] ${
                  tab === t.key ? 'border-brand-500 text-brand-500' : 'border-transparent text-sub hover:text-ink'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-sub text-sm">{products.length} products</p>
                <p className="text-faint text-xs mt-1">Drag products with the handle to move them to the top, middle, or bottom.</p>
              </div>
              <button onClick={startNew} className="btn-primary text-sm px-4 py-2.5">
                <Plus size={16} /> Add Product
              </button>
            </div>

            {orderMessage && (
              <div className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-600">
                {orderSaving ? 'Saving order...' : orderMessage}
              </div>
            )}

            {/* Product form */}
            {editing && (
              <div className="card p-6 mb-6 border-brand-500/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h3 className="font-display font-bold text-lg">{editing.id ? 'Edit Product' : 'New Product'}</h3>
                  <button onClick={() => setEditing(null)} className="text-sub hover:text-ink"><X size={18} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="label">Product Name *</label>
                    <input className="input" value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="e.g. HeatMaster 3000W Electric Shower" />
                  </div>
                  <div>
                    <label className="label">Model / SKU</label>
                    <input className="input" value={editing.model} onChange={e => setEditing(p => ({ ...p, model: e.target.value }))} placeholder="HM-3000" />
                  </div>
                  <div>
                    <label className="label">Category Group</label>
                    <select
                      className="input"
                      value={editing.group}
                      onChange={e => {
                        const group = e.target.value
                        // pick first cat in this group as default
                        const first = CATS.find(c => c.group === group)
                        setEditing(p => ({ ...p, group, cat: first?.value || p.cat, catLabel: first?.label || p.catLabel }))
                      }}
                    >
                      {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Subcategory *</label>
                    <select
                      className="input"
                      value={editing.cat}
                      onChange={e => setEditing(p => ({ ...p, cat: e.target.value, catLabel: CATS.find(c => c.value === e.target.value)?.label }))}
                    >
                      {CATS.filter(c => c.group === editing.group).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Price (KSh) *</label>
                    <input className="input" type="number" value={editing.price} onChange={e => setEditing(p => ({ ...p, price: e.target.value }))} placeholder="12500" />
                  </div>
                  <div>
                    <label className="label">Badge (optional)</label>
                    <input className="input" value={editing.badge} onChange={e => setEditing(p => ({ ...p, badge: e.target.value }))} placeholder="Best Seller" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Description</label>
                    <textarea className="input h-24 resize-none" value={editing.desc} onChange={e => setEditing(p => ({ ...p, desc: e.target.value }))} placeholder="Short product description..." />
                  </div>
                </div>

                {/* Images */}
                <div className="mb-4">
                  <label className="label">Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editing.images?.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-xl border border-dashed border-border hover:border-brand-500 flex items-center justify-center text-sub hover:text-brand-500 transition-colors">
                      <Upload size={20} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <label className="label">Key Features</label>
                  <div className="flex gap-2 mb-2">
                    <input className="input flex-1" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeature()} placeholder="e.g. Thermal cutoff protection" />
                    <button onClick={addFeature} className="btn-outline px-4 py-2.5 text-sm">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editing.features?.map((f, i) => (
                      <span key={i} className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-1 text-sm">
                        {f}
                        <button onClick={() => removeFeature(i)} className="text-sub hover:text-red-400"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specs */}
                <div className="mb-6">
                  <label className="label">Specifications</label>
                  <div className="flex gap-2 mb-2">
                    <input className="input flex-1" value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="e.g. Wattage" />
                    <input className="input flex-1" value={specVal} onChange={e => setSpecVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSpec()} placeholder="e.g. 3000W" />
                    <button onClick={addSpec} className="btn-outline px-4 py-2.5 text-sm">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(editing.specs || {}).map(([k, v]) => (
                      <span key={k} className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-1 text-sm">
                        <span className="text-sub">{k}:</span> {v}
                        <button onClick={() => removeSpec(k)} className="text-sub hover:text-red-400"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Product'}
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
                </div>
              </div>
            )}

            {/* Product list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map(p => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => setDraggedProductId(p.id)}
                  onDragEnd={() => {
                    setDraggedProductId(null)
                    setDragOverProductId(null)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (dragOverProductId !== p.id) setDragOverProductId(p.id)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleProductDrop(p.id)
                  }}
                  className={`card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-move transition-all ${
                    draggedProductId === p.id ? 'opacity-60 ring-2 ring-brand-200' : ''
                  } ${
                    dragOverProductId === p.id ? 'ring-2 ring-brand-400 shadow-product-hover' : ''
                  }`}
                >
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDraggedProductId(p.id)}
                    className="shrink-0 rounded-xl border border-border bg-muted p-2 text-sub hover:text-brand-500"
                    title="Drag to reorder"
                  >
                    <GripVertical size={16} />
                  </button>
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink truncate">{p.name}</p>
                    <p className="text-sub text-xs capitalize">{p.catLabel || p.cat} · KSh {Number(p.price).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0 shrink-0">
                    <button onClick={() => startEdit(p)} className="p-2 text-sub hover:text-brand-500 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-sub hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-16 text-sub">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No products yet. Add your first one!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SERVICES TAB ── */}
        {tab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sub text-sm">{services.length} services</p>
                <p className="text-faint text-xs mt-1">Manage service cards shown on the Services page</p>
              </div>
              <button onClick={startNewService} className="btn-primary text-sm px-4 py-2.5">
                <Plus size={16} /> Add Service
              </button>
            </div>

            {/* Service Edit Form */}
            {editingService && (
              <div className="card p-6 mb-6 border-brand-500/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display font-bold text-lg">{editingService.id ? 'Edit Service' : 'New Service'}</h3>
                  <button onClick={() => setEditingService(null)} className="text-sub hover:text-ink"><X size={18} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="label">Service Title *</label>
                    <input className="input" value={editingService.title} onChange={e => setEditingService(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Water Heater Installation" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Description</label>
                    <textarea className="input h-24 resize-none" value={editingService.description} onChange={e => setEditingService(p => ({ ...p, description: e.target.value }))} placeholder="Short service description..." />
                  </div>

                  <div>
                    <label className="label">Icon</label>
                    <select className="input" value={editingService.icon_name} onChange={e => setEditingService(p => ({ ...p, icon_name: e.target.value }))}>
                      {ICON_OPTIONS.map(icon => (<option key={icon.value} value={icon.value}>{icon.label}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Animation Style</label>
                    <select className="input" value={editingService.animation_style} onChange={e => setEditingService(p => ({ ...p, animation_style: e.target.value }))}>
                      {ANIMATION_STYLES.map(style => (<option key={style.value} value={style.value}>{style.label}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Badge Text (optional)</label>
                    <input className="input" value={editingService.badge_text || ''} onChange={e => setEditingService(p => ({ ...p, badge_text: e.target.value }))} placeholder="Popular, Best Seller, etc." />
                  </div>

                  <div>
                    <label className="label">CTA Button Text</label>
                    <input className="input" value={editingService.cta_text || 'Learn More'} onChange={e => setEditingService(p => ({ ...p, cta_text: e.target.value }))} placeholder="Learn More" />
                  </div>

                  <div>
                    <label className="label">Order Index (lower = higher position)</label>
                    <input type="number" className="input" value={editingService.order_index} onChange={e => setEditingService(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} placeholder="0, 1, 2..." />
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <label className="label flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingService.is_active} onChange={e => setEditingService(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4" />
                      Active (show on website)
                    </label>
                  </div>

                  {/* Service Image Upload */}
                  <div className="md:col-span-2">
                    <label className="label">Service Image (600x400px recommended)</label>
                    <div className="flex gap-4 items-start">
                      {serviceImagePreview ? (
                        <div className="relative">
                          <img src={serviceImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-border" />
                          <button onClick={() => { setServiceImagePreview(''); setServiceImageFile(null); setEditingService(p => ({ ...p, image_url: null })) }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"><X size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => serviceFileRef.current?.click()} className="w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-brand-500 flex flex-col items-center justify-center gap-1 text-sub hover:text-brand-500 transition-colors">
                          <Upload size={20} />
                          <span className="text-xs">Upload image</span>
                        </button>
                      )}
                      <input ref={serviceFileRef} type="file" accept="image/*" className="hidden" onChange={handleServiceImageSelect} />
                      <p className="text-faint text-xs max-w-xs">Images will be displayed at the top of service cards with your chosen animation effect.</p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="md:col-span-2">
                    <label className="label">Key Features (shown as checklist)</label>
                    <div className="flex gap-2 mb-2">
                      <input id="new-feature-input" className="input flex-1" placeholder="e.g. Professional installation" onKeyDown={e => e.key === 'Enter' && addServiceFeature()} />
                      <button onClick={addServiceFeature} className="btn-outline px-4 py-2.5 text-sm">Add Feature</button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(editingService.features || []).map((f, i) => (
                        <span key={i} className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-1 text-sm">{f}
                          <button onClick={() => removeServiceFeature(i)} className="text-sub hover:text-red-400"><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    {(!editingService.features || editingService.features.length === 0) && (<p className="text-faint text-xs mt-2">Add features to showcase what makes this service great</p>)}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={saveService} disabled={serviceSaving} className="btn-primary"><Save size={16} /> {serviceSaving ? 'Saving...' : 'Save Service'}</button>
                  <button onClick={() => setEditingService(null)} className="btn-outline">Cancel</button>
                </div>
              </div>
            )}

            {/* Service List */}
            <div className="grid grid-cols-1 gap-3">
              {services.map(s => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => setDraggedServiceId(s.id)}
                  onDragEnd={() => { setDraggedServiceId(null); setDragOverServiceId(null) }}
                  onDragOver={(e) => { e.preventDefault(); if (dragOverServiceId !== s.id) setDragOverServiceId(s.id) }}
                  onDrop={(e) => { e.preventDefault(); handleServiceDrop(s.id) }}
                  className={`card p-4 flex items-center gap-4 hover:shadow-md transition-shadow ${draggedServiceId === s.id ? 'opacity-60 ring-2 ring-brand-200' : ''} ${dragOverServiceId === s.id ? 'ring-2 ring-brand-400 shadow-product-hover' : ''}`}
                >
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-2xl">{
                      s.icon_name === 'Zap' ? '⚡' : s.icon_name === 'Sun' ? '☀️' : s.icon_name === 'Droplets' ? '💧' : s.icon_name === 'ToggleRight' ? '🔘' : s.icon_name === 'Wrench' ? '🔧' : s.icon_name === 'PhoneCall' ? '📞' : '✨'
                    }</div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-sm">{s.title}</p>
                      {s.badge_text && (<span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{s.badge_text}</span>)}
                      {!s.is_active && (<span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>)}
                      <span className="text-xs text-sub">Order: {s.order_index}</span>
                    </div>
                    <p className="text-sub text-xs mt-1">Animation: {ANIMATION_STYLES.find(a => a.value === s.animation_style)?.label.split(' - ')[0] || s.animation_style}{s.features && s.features.length > 0 ? ` · ${s.features.length} features` : ''}{s.image_url ? ' · Has image' : ''}</p>
                    {s.description && (<p className="text-faint text-xs mt-1 line-clamp-1">{s.description}</p>)}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" draggable onDragStart={() => setDraggedServiceId(s.id)} className="shrink-0 rounded-xl border border-border bg-muted p-2 text-sub hover:text-brand-500" title="Drag to reorder">
                      <GripVertical size={16} />
                    </button>
                    <button onClick={() => startEditService(s)} className="p-2 text-sub hover:text-brand-500 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => deleteService(s.id)} className="p-2 text-sub hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {services.length === 0 && !editingService && (
                <div className="text-center py-16 text-sub">
                  <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No services yet. Click "Add Service" to create your first service card!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TESTIMONIALS TAB ── */}
        {tab === 'testimonials' && (
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Add Testimonial</h3>
            <div className="card p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Customer Name</label>
                <input className="input" value={tForm.name} onChange={e => setTForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane M." />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={tForm.location} onChange={e => setTForm(f => ({ ...f, location: e.target.value }))} placeholder="Nairobi" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Review Text</label>
                <textarea className="input h-24 resize-none" value={tForm.text} onChange={e => setTForm(f => ({ ...f, text: e.target.value }))} placeholder="Amazing product, works perfectly..." />
              </div>
              <div className="md:col-span-2">
                <button onClick={saveTestimonial} className="btn-primary"><Save size={16} /> Save</button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {testimonials.map(t => (
                <div key={t.id} className="card p-4 flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-display font-semibold text-sm">{t.name} <span className="text-sub font-normal">· {t.location}</span></p>
                    <p className="text-sub text-sm mt-1 italic">"{t.text}"</p>
                  </div>
                  <button onClick={() => deleteTestimonial(t.id).then(() => getTestimonials().then(setTestimonials))}
                    className="p-2 text-sub hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAGE CONTENT TAB (VISUAL EDITOR) ── */}
        {tab === 'pageContent' && (() => {
          const schemas = getPageSectionSchemas()
          const makeSections = (page) =>
            Object.entries(schemas[page] || {}).map(([key, def]) => ({
              section_key: key,
              label: def.label,
              description: def.description,
              schema: def.schema,
              content: pageContent[page]?.[key] || {},
            }))
          return (
            <div className="space-y-8">
              <div className="card p-6">
                <PageContentEditor
                  pageContent={{ page_slug: 'about', sections: makeSections('about') }}
                  onSaved={loadPageContent}
                />
              </div>
              <div className="card p-6">
                <PageContentEditor
                  pageContent={{ page_slug: 'portfolio', sections: makeSections('portfolio') }}
                  onSaved={loadPageContent}
                />
              </div>
            </div>
          )
        })()}

        {/* ── GALLERY TAB ── */}
        {tab === 'gallery' && (
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Add Gallery Image</h3>
            <div className="card p-6 mb-6">
              {/* Image upload area */}
              <div className="mb-4">
                <label className="label">Image *</label>
                {galleryImageUrl ? (
                  <div className="relative inline-block mb-3">
                    <img src={galleryImageUrl} alt="Preview" className="w-40 h-40 object-cover rounded-xl border border-border" />
                    <button
                      onClick={() => setGalleryImageUrl('')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => galleryFileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all"
                  >
                    {galleryUploading ? (
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload size={28} className="text-sub mb-2" />
                        <p className="text-sub text-sm">Click to upload image</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={galleryFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    setGalleryUploading(true)
                    try {
                      const url = await uploadImage(file, 'gallery')
                      setGalleryImageUrl(url)
                    } catch (err) {
                      alert('Upload failed: ' + err.message)
                    } finally {
                      setGalleryUploading(false)
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Title</label>
                  <input
                    className="input"
                    value={galleryForm.title}
                    onChange={e => setGalleryForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Electric shower installation – Kilimani"
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={galleryForm.category}
                    onChange={e => setGalleryForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="installation">Installation</option>
                    <option value="showroom">Showroom</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Description (optional)</label>
                  <input
                    className="input"
                    value={galleryForm.description}
                    onChange={e => setGalleryForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short caption shown on hover"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!galleryImageUrl) return alert('Please upload an image first.')
                  try {
                    const { error } = await (await import('../lib/supabase')).supabase
                      .from('gallery_images')
                      .insert({ image_url: galleryImageUrl, title: galleryForm.title, description: galleryForm.description, category: galleryForm.category })
                    if (error) throw error
                    setGalleryImageUrl('')
                    setGalleryForm({ title: '', description: '', category: 'installation' })
                    getGalleryImages().then(setGalleryImages)
                  } catch (err) {
                    alert('Save failed: ' + err.message)
                  }
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={16} /> Save to Gallery
              </button>
            </div>

            {/* Gallery grid */}
            <h3 className="font-display font-semibold text-base mb-3 text-sub">{galleryImages.length} images in gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map(img => (
                <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-border">
                  <img src={img.image_url} alt={img.title} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div>
                      {img.title && <p className="text-white text-xs font-semibold truncate">{img.title}</p>}
                      <span className="text-white/60 text-xs">{img.category}</span>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this image?')) return
                        const { supabase } = await import('../lib/supabase')
                        await supabase.from('gallery_images').delete().eq('id', img.id)
                        getGalleryImages().then(setGalleryImages)
                      }}
                      className="self-end bg-red-500 hover:bg-red-600 text-white rounded-lg p-1.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {galleryImages.length === 0 && (
                <div className="col-span-4 text-center py-16 text-sub">
                  <Image size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No gallery images yet. Add your first one above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="max-w-xl">
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">WhatsApp Number (with country code)</label>
                <input className="input" value={settings.whatsapp_number} onChange={e => setSettings(s => ({ ...s, whatsapp_number: e.target.value }))} placeholder="254701039256" />
              </div>
              <div>
                <label className="label">Hero Title (use | to split lines)</label>
                <input className="input" value={settings.hero_title} onChange={e => setSettings(s => ({ ...s, hero_title: e.target.value }))} placeholder="Hot Water.|Every Morning." />
              </div>
              <div>
                <label className="label">Hero Subtitle</label>
                <textarea className="input h-20 resize-none" value={settings.hero_subtitle} onChange={e => setSettings(s => ({ ...s, hero_subtitle: e.target.value }))} />
              </div>
              <div>
                <label className="label">Customers Stat (e.g. 500+)</label>
                <input className="input" value={settings.stat_customers} onChange={e => setSettings(s => ({ ...s, stat_customers: e.target.value }))} />
              </div>
              <div>
                <label className="label">Rating Stat (e.g. 4.9/5)</label>
                <input className="input" value={settings.stat_rating} onChange={e => setSettings(s => ({ ...s, stat_rating: e.target.value }))} />
              </div>
              <button onClick={handleSaveSettings} className="btn-primary mt-2">
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>
        )}

        {tab === 'admins' && (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
              <div>
                <p className="text-sub text-sm">{admins.length} admin{admins.length === 1 ? '' : 's'}</p>
                <h2 className="font-display font-bold text-xl">Admin users</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="Enter user email"
                  className="input w-full sm:w-[280px]"
                />
                <button
                  type="button"
                  onClick={handlePromoteAdmin}
                  disabled={adminActionLoading}
                  className="btn-primary px-4 py-2"
                >
                  Add Admin
                </button>
              </div>
            </div>
            {adminMessage && (
              <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700">
                {adminMessage}
              </div>
            )}
            <div className="overflow-hidden rounded-3xl border border-border bg-white">
              {admins.length === 0 ? (
                <div className="p-6 text-center text-sub">No admins added yet.</div>
              ) : (
                <div className="grid gap-2">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-border last:border-b-0">
                      <div>
                        <p className="font-medium text-ink">{admin.email}</p>
                        <p className="text-sm text-sub">{admin.name || 'No name provided'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-[11px] font-semibold uppercase text-brand-700">Admin</span>
                        <button
                          type="button"
                          onClick={() => handleDemoteAdmin(admin.id)}
                          disabled={adminActionLoading || admin.id === user?.id}
                          className="btn-ghost text-sm text-red-500 disabled:opacity-50"
                        >
                          {admin.id === user?.id ? 'Current admin' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
