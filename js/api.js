import { supabase } from './supabase.js'

// ── Auth ──────────────────────────────────────────────────────────────
export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}

export async function isAdmin() {
  try {
    const profile = await getProfile()
    return profile?.role === 'admin'
  } catch(e) {
    console.warn('isAdmin check failed:', e.message)
    return false  // If there's an error, assume not admin
  }
}

export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}

// ── Products ──────────────────────────────────────────────────────────
const CAT_LABELS = {
  standard: 'Wall Heaters',
  pump: 'With Pump',
  showerhead: 'Shower Heads',
  accessory: 'Accessories'
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

export async function createProduct(payload) {
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...payload, catLabel: CAT_LABELS[payload.cat] }])
    .select()
  if (error) throw new Error(error.message)
  return data[0]
}

export async function updateProduct(id, payload) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...payload, catLabel: CAT_LABELS[payload.cat] })
    .eq('id', id)
    .select()
  if (error) throw new Error(error.message)
  return data[0]
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchWishlist() {
  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
  if (error) throw new Error(error.message)
  return (data || []).map(row => row.product_id)
}

export async function addToWishlist(productId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: user.id, product_id: productId })
  if (error) throw new Error(error.message)
}

export async function removeFromWishlist(productId) {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('product_id', productId)
  if (error) throw new Error(error.message)
}

// ── Image Upload ──────────────────────────────────────────────────────
export async function uploadProductImage(file, productName) {
  const ext = file.name.split('.').pop()
  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const fileName = `${Date.now()}-${safeName}.${ext}`
  const { error } = await supabase.storage.from('products').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('products').getPublicUrl(fileName)
  return data.publicUrl
}

export async function uploadMultipleImages(files, productName) {
  const urls = []
  for (const file of files) {
    const url = await uploadProductImage(file, productName)
    urls.push(url)
  }
  return urls
}

export async function uploadSiteAsset(file, label = 'site-media') {
  const ext = file.name.split('.').pop()
  const safeLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const fileName = `site/${Date.now()}-${safeLabel}.${ext}`
  const { error } = await supabase.storage.from('products').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('products').getPublicUrl(fileName)
  return data.publicUrl
}

export async function uploadSiteAssets(files, labelPrefix = 'site-media') {
  const urls = []
  for (const [index, file] of Array.from(files).entries()) {
    const url = await uploadSiteAsset(file, `${labelPrefix}-${index + 1}`)
    urls.push(url)
  }
  return urls
}

export async function deleteProductImage(imageUrl) {
  if (!imageUrl) return
  const parts = imageUrl.split('/products/')
  if (parts.length < 2) return
  const fileName = parts[1]
  await supabase.storage.from('products').remove([fileName])
}

// ── Homepage ──────────────────────────────────────────────────────────
export async function fetchHomepage() {
  const { data, error } = await supabase.from('homepage').select('*').eq('id', 1).single()
  if (error) throw new Error(error.message)
  return data
}

export async function saveHomepage(payload) {
  const { error } = await supabase
    .from('homepage')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) throw new Error(error.message)
}

// ── Settings ──────────────────────────────────────────────────────────
export async function fetchSettings() {
  const { data, error } = await supabase.from('settings').select('*')
  if (error) throw new Error(error.message)
  const obj = {}
  data.forEach(row => { obj[row.key] = row.value })
  return obj
}

export async function saveSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value })
  if (error) throw new Error(error.message)
}
