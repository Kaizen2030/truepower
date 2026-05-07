import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'
import { getProfile, upsertProfile, uploadImage } from '../lib/supabase'

export default function AccountPage() {
  const auth = useAuth()
  const { user } = auth ?? {}
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user) return setLoading(false)
    getProfile(user.id).then(p => { setProfile(p || {}); setLoading(false) }).catch(() => setLoading(false))
  }, [user])

  const save = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = { id: user.id, full_name: profile.full_name || null, phone: profile.phone || null, avatar_url: profile.avatar_url || null }
      await upsertProfile(payload)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarSelect = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarPreview(URL.createObjectURL(f))
    setAvatarFile(f)
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return
    setSavingAvatar(true)
    try {
      const publicUrl = await uploadImage(avatarFile, 'avatars')
      await upsertProfile({ id: user.id, avatar_url: publicUrl })
      setProfile(p => ({ ...(p||{}), avatar_url: publicUrl }))
      setAvatarFile(null)
      setAvatarPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Avatar upload failed', err)
    } finally {
      setSavingAvatar(false)
    }
  }

  if (loading) return <div className="pt-[120px] min-h-screen flex items-center justify-center">Loading…</div>

  return (
    <main className="pt-[120px] min-h-screen bg-white">
      <Seo title="My Account" description="Manage your account details" path="/account" />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="font-display font-extrabold text-2xl mb-4">Account</h1>
        <div className="bg-muted p-6 rounded-lg">
          <div className="mb-4 flex items-center gap-4">
            <div>
              {profile?.avatar_url || avatarPreview ? (
                <img src={avatarPreview || profile?.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-ink">{(profile?.full_name || user?.email || 'U').slice(0,2).toUpperCase()}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-sub mb-1">Change avatar</label>
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="text-sm" />
                <button onClick={uploadAvatar} disabled={!avatarFile || savingAvatar} className="btn-outline text-sm">{savingAvatar ? 'Uploading…' : 'Upload'}</button>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-sub mb-1">Name</label>
            <input value={profile?.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full p-2 border border-border rounded" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-sub mb-1">Email</label>
            <input value={user?.email || ''} readOnly className="w-full p-2 border border-border rounded bg-white/60" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-sub mb-1">Phone</label>
            <input value={profile?.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-2 border border-border rounded" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save profile'}</button>
          </div>
        </div>
      </div>
    </main>
  )
}
