let supabase = null
let backendReady = false
let backendInitError = null

function getBackendUnavailableError() {
  const detail = backendInitError?.message ? ` ${backendInitError.message}` : ''
  return new Error(`Live backend is unavailable.${detail}`)
}

async function backendUnavailable() {
  throw getBackendUnavailableError()
}

// ── Mobile Menu Functions ───────────────────────
function setMobileMenuState(open) {
  const menu = document.getElementById('navMobileMenu')
  const button = document.getElementById('navHamburger')
  if (!menu) return
  menu.classList.toggle('open', open)
  document.body.classList.toggle('mobile-menu-open', open)
  if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false')
}

window.toggleMobileMenu = function() {
  const menu = document.getElementById('navMobileMenu')
  setMobileMenuState(!(menu && menu.classList.contains('open')))
}
window.closeMobileMenu = function() {
  setMobileMenuState(false)
}

// Update mobile menu admin links visibility
window.updateMobileMenuAdminLinks = function() {
  const adminLinksDiv = document.getElementById('mobileAdminLinks')
  const isUserAdmin = document.getElementById('navAdminBtn')?.style.display !== 'none'
  if (adminLinksDiv) {
    adminLinksDiv.style.display = isUserAdmin ? 'flex' : 'none'
  }
}

// Navigate to admin section from mobile menu
window.adminNavMobile = function(section) {
  setTimeout(() => {
    const btn = document.querySelector(`[data-sec="${section}"]`)
    if (btn) btn.click()
  }, 100)
}

let login = backendUnavailable
let logout = async () => {}
let isAdmin = async () => false
let changePassword = backendUnavailable
let fetchProducts = async () => []
let createProduct = backendUnavailable
let updateProduct = backendUnavailable
let deleteProduct = backendUnavailable
let uploadProductImage = backendUnavailable
let uploadMultipleImages = backendUnavailable
let deleteProductImage = backendUnavailable
let uploadSiteAssets = backendUnavailable
let fetchHomepage = async () => null
let saveHomepage = backendUnavailable
let fetchSettings = async () => ({})
let saveSetting = backendUnavailable
let fetchWishlist = async () => []
let addToWishlist = backendUnavailable
let removeFromWishlist = backendUnavailable

// ── State ─────────────────────────────────────────────
let products = []
let settings = {}
let currentFilter = 'all'
let adminCatFilter = 'all'
let searchQuery = ''
let adminSearchQuery = ''
let editingId = null
let pendingDeleteId = null
let pendingDeleteImageUrl = null
let fromPage = 'shop'
let newImageFile = null
let currentPage = 'home'
let heroSlideTimer = null
let heroSlideIndex = 0
let heroMediaUrls = []
let heroMediaPendingFiles = []
let siteGalleryUrls = []
let siteGalleryPendingFiles = []
let testimonialsDraft = []
let wishlistIds = new Set() // holds product IDs the user wishlisted

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Grace W.',
    location: 'Nairobi',
    quote: 'The advice was clear, the heater looked great, and ordering on WhatsApp was fast.',
    rating: 5
  },
  {
    name: 'Dennis M.',
    location: 'Kiambu',
    quote: 'We needed a unit that could handle low pressure. The recommendation was exactly right.',
    rating: 5
  },
  {
    name: 'Janet N.',
    location: 'Westlands',
    quote: 'The showroom photos and product guidance gave me confidence before I bought.',
    rating: 5
  }
]

const DEFAULT_ABOUT_CONTENT = {
  eyebrow: 'About TruePower',
  title: 'Reliable water heating for Kenyan homes and buildings.',
  intro: 'We help shoppers choose the right heater for borehole water, pressure challenges, and clean everyday performance.',
  storyTitle: 'Advice that matches your water pressure, water source, and finish preference.',
  storyBody: 'From first WhatsApp contact to final product choice, we focus on practical guidance and reliable products that suit Kenyan homes.',
  videoUrl: '',
  card1Title: 'Visit or chat first',
  card1Body: 'Come to the Nyamakima showroom or send us your needs on WhatsApp so we can understand the setup before you buy.',
  card2Title: 'Choose the right heater',
  card2Body: 'We match products to borehole water, pressure issues, bathroom space, and the finish you want in the home.',
  card3Title: 'Order with confidence',
  card3Body: 'You get a clear quote, product photos, and direct support before pickup or delivery is arranged.'
}

const PAGES = ['home','shop','wishlist','detail','about','login','register','forgot','admin']

function getBackendErrorMessage(action = 'complete this action') {
  const detail = backendInitError?.message ? ` ${backendInitError.message}` : ''
  return `Couldn't ${action} because the live backend did not load.${detail}`
}

function setGlobalNotice(message = '') {
  let notice = document.getElementById('globalNotice')
  if (!message) {
    if (notice) notice.remove()
    return
  }

  if (!notice) {
    notice = document.createElement('div')
    notice.id = 'globalNotice'
    notice.style.cssText = 'position:sticky;top:64px;z-index:190;background:#FEF3C7;color:#92400E;padding:12px 16px;border-bottom:1px solid #F59E0B;font:600 14px/1.5 DM Sans,sans-serif;'
    const nav = document.querySelector('.nav')
    if (nav) {
      nav.insertAdjacentElement('afterend', notice)
    } else {
      document.body.insertBefore(notice, document.body.firstChild)
    }
  }

  notice.textContent = message
}

async function ensureBackend() {
  if (backendReady && supabase) return true

  try {
    const [supabaseModule, apiModule] = await Promise.all([
      import('./supabase.js'),
      import('./api.js')
    ])

    supabase = supabaseModule.supabase
    ;({
      login,
      logout,
      isAdmin,
      changePassword,
      fetchProducts,
      createProduct,
      updateProduct,
      deleteProduct,
      uploadProductImage,
      uploadMultipleImages,
      deleteProductImage,
      uploadSiteAssets,
      fetchHomepage,
      saveHomepage,
      fetchSettings,
      saveSetting,
      fetchWishlist,
      addToWishlist,
      removeFromWishlist
    } = apiModule)

    backendReady = true
    backendInitError = null
    setGlobalNotice('')
    return true
  } catch (error) {
    backendReady = false
    backendInitError = error instanceof Error ? error : new Error(String(error))
    console.warn('Backend init error:', backendInitError.message)
    setGlobalNotice('Live data and admin sign-in are unavailable because the backend client could not load in this browser.')
    return false
  }
}

async function ensureBackendOrShow(msgEl, action) {
  const ready = await ensureBackend()
  if (!ready) {
    showMsg(msgEl, 'error', getBackendErrorMessage(action))
    return false
  }
  return true
}

async function loadWishlist() {
  if (!supabase) {
    wishlistIds = new Set()
    return
  }

  const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
  if (!user) {
    wishlistIds = new Set()
    return
  }

  try {
    const ids = await fetchWishlist()
    wishlistIds = new Set((ids || []).map(id => Number(id)))
  } catch (_e) {
    wishlistIds = new Set()
  }
}

function refreshWishlistViews() {
  if (currentPage === 'home') renderHome()
  if (currentPage === 'shop') renderShop()
  if (currentPage === 'wishlist') renderWishlist()
}

// ── Router ────────────────────────────────────────────
window.goPage = function(page) {
  currentPage = page
  window.closeMobileMenu()
  PAGES.forEach(p => {
    const el = document.getElementById(`page-${p}`)
    if (el) el.style.display = (p === page) ? '' : 'none'
  })
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === page)
  })
  const isAdmin_ = page === 'admin'
  document.getElementById('mainFooter').style.display = isAdmin_ ? 'none' : ''
  document.getElementById('waFloat').style.display = isAdmin_ ? 'none' : ''
  if (page !== 'home' && heroSlideTimer) {
    clearInterval(heroSlideTimer)
    heroSlideTimer = null
  }
  window.scrollTo(0, 0)
  if (page === 'home') renderHome()
  if (page === 'shop') renderShop()
  if (page === 'wishlist') renderWishlist()
  if (page === 'about') renderAbout()
  if (page === 'admin') {
    window.updateMobileMenuAdminLinks()
    initAdmin()
  }
}

window.goBack = () => window.goPage(fromPage)

// ── Boot ──────────────────────────────────────────────
async function boot() {
  const syncRoute = () => {
    const hash = window.location.hash.replace('#','') || 'home'
    window.goPage(PAGES.includes(hash) ? hash : 'home')
  }

  syncRoute()
  window.addEventListener('hashchange', syncRoute)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) window.closeMobileMenu()
  })

  const backendLoaded = await ensureBackend()

  if (backendLoaded) {
    try {
      const [prods, sett] = await Promise.all([fetchProducts(), fetchSettings()])
      products = prods
      settings = sett
    } catch (e) {
      console.warn('Boot load error:', e.message)
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      await updateNavAuth(session)

      supabase.auth.onAuthStateChange((_e, session) => {
        updateNavAuth(session)
      })
    } catch (e) {
      console.warn('Auth init error:', e.message)
      await updateNavAuth(null)
    }
  } else {
    products = []
    settings = {}
    await updateNavAuth(null)
  }

  window.goPage(currentPage)
}

async function updateNavAuth(session) {
  const loggedIn = !!session
  const navAdminBtn = document.getElementById('navAdminBtn')
  const mobileNavAdminBtn = document.getElementById('mobileNavAdminBtn')
  navAdminBtn.style.display = 'none'
  if (mobileNavAdminBtn) mobileNavAdminBtn.style.display = 'none'
  document.getElementById('navLoginBtn').style.display = loggedIn ? 'none' : ''
  document.getElementById('navRegisterBtn').style.display = loggedIn ? 'none' : ''
  document.getElementById('navLogoutBtn').style.display = loggedIn ? '' : 'none'
  const mobileLoginBtn = document.getElementById('mobileNavLoginBtn')
  const mobileRegisterBtn = document.getElementById('mobileNavRegisterBtn')
  const mobileLogoutBtn = document.getElementById('mobileNavLogoutBtn')
  if (mobileLoginBtn) mobileLoginBtn.style.display = loggedIn ? 'none' : ''
  if (mobileRegisterBtn) mobileRegisterBtn.style.display = loggedIn ? 'none' : ''
  if (mobileLogoutBtn) mobileLogoutBtn.style.display = loggedIn ? '' : 'none'
  const nameEl = document.getElementById('navUserName')
  const mobileNameEl = document.getElementById('mobileNavUserName')
  if (loggedIn && session.user) {
    nameEl.style.display = ''
    nameEl.textContent = session.user.email.split('@')[0]
    if (mobileNameEl) {
      mobileNameEl.style.display = ''
      mobileNameEl.textContent = `Signed in as ${session.user.email.split('@')[0]}`
    }
  } else {
    nameEl.style.display = 'none'
    if (mobileNameEl) {
      mobileNameEl.style.display = 'none'
      mobileNameEl.textContent = ''
    }
  }

  if (loggedIn) {
    await loadWishlist()
    try {
      const admin = await isAdmin()
      navAdminBtn.style.display = admin ? '' : 'none'
      if (mobileNavAdminBtn) mobileNavAdminBtn.style.display = admin ? '' : 'none'
    } catch (_e) {
      navAdminBtn.style.display = 'none'
      if (mobileNavAdminBtn) mobileNavAdminBtn.style.display = 'none'
    }
  } else {
    wishlistIds = new Set()
  }

  refreshWishlistViews()
}

// ── HOME ──────────────────────────────────────────────
async function renderHome() {
  // Load homepage content
  try {
    const hp = await fetchHomepage()
    if (hp) {
      const heroKicker = hp.hero_kicker === '🔥 Hot Water Experts Since 2020'
        ? 'Trusted Hot Water Specialists'
        : (hp.hero_kicker || 'Trusted Hot Water Specialists')
      const heroSubtitle = hp.hero_subtitle === "Kenya's most reliable electric showers and water heaters. Built for borehole water, low pressure, and salty conditions — so you never wake up to a cold shower again."
        ? 'Electric showers, wall heaters, and pump-assisted systems selected for Kenyan homes, borehole water, and low-pressure plumbing.'
        : (hp.hero_subtitle || 'Electric showers, wall heaters, and pump-assisted systems selected for Kenyan homes, borehole water, and low-pressure plumbing.')
      setEl('heroKicker', heroKicker)
      // Title with | as line break, second segment highlighted
      const parts = (hp.hero_title || '').split('|')
      const titleHtml = parts.map((p,i) => i===1 ? `<span>${esc(p)}</span>` : esc(p)).join('<br>')
      const titleEl = document.getElementById('heroTitle')
      if (titleEl) titleEl.innerHTML = titleHtml
      setEl('heroSubtitle', heroSubtitle)
      // Proof cards
      setEl('heroStatProducts', hp.hero_proof1 || '22+')
      setEl('heroRating', hp.hero_proof2 || '4.9/5')
      setEl('heroPickup', hp.hero_proof3 || 'Same Day')
      // Why cards
      for (let i=1;i<=4;i++) {
        setEl(`why${i}icon`, hp[`why${i}_icon`])
        setEl(`why${i}title`, hp[`why${i}_title`])
        setEl(`why${i}desc`, hp[`why${i}_desc`])
      }
    }
  } catch(e) {}

  const statEl = document.getElementById('heroStatProducts')
  setEl('metricProducts', products.length + '+')

  renderCategoryCards()
  renderHeroMedia(getHomeMedia())
  renderShowcaseGallery(getSiteGallery())
  renderTestimonials(getTestimonials(), 'testimonialGrid')
  stopTestimonialAutoScroll()
  setTimeout(startTestimonialAutoScroll, 1000)

  const grid = document.getElementById('homeFeatured')
  const featured = products.slice(0, 6)
  if (!featured.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Products coming soon</h3><p>Our latest range will appear here shortly.</p></div>`
    return
  }
  grid.innerHTML = featured.map(productCardHTML).join('')
}

// ── SHOP ──────────────────────────────────────────────
function parseJsonSetting(value, fallback) {
  if (value == null || value === '') return fallback
  if (Array.isArray(value) || typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch (_e) {
    return fallback
  }
}

function getProductImagePool(limit = 8) {
  return products
    .map(getFirstImage)
    .filter(Boolean)
    .slice(0, limit)
}

function getHomeMedia() {
  const saved = parseJsonSetting(settings.home_media_json, [])
  return Array.isArray(saved) && saved.length ? saved : getProductImagePool(4)
}

function getSiteGallery() {
  const saved = parseJsonSetting(settings.site_gallery_json, [])
  return Array.isArray(saved) && saved.length ? saved : getProductImagePool(8)
}

function getTestimonials() {
  const saved = parseJsonSetting(settings.testimonials_json, DEFAULT_TESTIMONIALS)
  return Array.isArray(saved) && saved.length ? saved : DEFAULT_TESTIMONIALS
}

function getAboutContent() {
  const saved = parseJsonSetting(settings.about_content_json, {})
  return { ...DEFAULT_ABOUT_CONTENT, ...saved }
}

async function renderWishlist() {
  const container = document.getElementById('wishlist-grid')
  if (!container) return

  if (!await ensureBackend()) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>Wishlist unavailable</h3><p>We could not load saved items right now.</p></div>'
    return
  }

  container.innerHTML = '<div class="spinner-wrap" style="grid-column:1/-1"><div class="spinner"></div></div>'
  await loadWishlist()

  const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
  if (!user) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>Sign in to view your wishlist</h3>
        <p>Save products you like and come back to them anytime.</p>
        <div style="display:flex;justify-content:center;gap:.75rem;flex-wrap:wrap">
          <button class="btn btn-primary" type="button" onclick="window.goPage('login')">Sign In</button>
          <button class="btn btn-ghost" type="button" onclick="window.goPage('register')">Create Account</button>
        </div>
      </div>
    `
    return
  }

  let allProducts = products
  try {
    allProducts = await fetchProducts()
    products = allProducts
  } catch (e) {
    console.warn('Wishlist product load error:', e.message)
  }

  const wished = allProducts.filter(product => wishlistIds.has(Number(product.id)))
  if (!wished.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>Your wishlist is empty</h3>
        <p>Save a few favorites while you browse and they will appear here.</p>
        <button class="btn btn-primary" type="button" onclick="window.goPage('shop')">Browse Products</button>
      </div>
    `
    return
  }

  container.innerHTML = wished.map(productCardHTML).join('')
}

function renderCategoryCards() {
  const configs = [
    { cat: 'standard', mediaId: 'cat-standard-media', countId: 'cat-standard-count', fallback: 'Wall heaters' },
    { cat: 'pump', mediaId: 'cat-pump-media', countId: 'cat-pump-count', fallback: 'Pump systems' },
    { cat: 'showerhead', mediaId: 'cat-showerhead-media', countId: 'cat-showerhead-count', fallback: 'Shower heads' },
    { cat: 'accessory', mediaId: 'cat-accessory-media', countId: 'cat-accessory-count', fallback: 'Accessories' }
  ]

  configs.forEach(({ cat, mediaId, countId, fallback }) => {
    const list = products.filter(p => p.cat === cat)
    const image = list.map(getFirstImage).find(Boolean)
    const mediaEl = document.getElementById(mediaId)
    const countEl = document.getElementById(countId)
    if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? 'model' : 'models'}`
    if (mediaEl) {
      mediaEl.innerHTML = image
        ? `<img src="${esc(image)}" alt="${esc(fallback)}" loading="lazy">`
        : `<div class="cat-card-placeholder">${esc(fallback)}</div>`
    }
  })
}

function renderHeroMedia(slides) {
  const stage = document.getElementById('heroMediaStage')
  const dots = document.getElementById('heroMediaDots')
  if (!stage || !dots) return

  const media = Array.isArray(slides) ? slides.filter(Boolean).slice(0, 4) : []
  if (heroSlideTimer) {
    clearInterval(heroSlideTimer)
    heroSlideTimer = null
  }

  if (!media.length) {
    stage.innerHTML = '<div class="hero-media-empty">Featured visuals will appear here soon.</div>'
    dots.innerHTML = ''
    return
  }

  heroSlideIndex = 0
  stage.innerHTML = media.map((url, index) => `
    <div class="hero-slide${index === 0 ? ' active' : ''}">
      <img src="${esc(url)}" alt="TruePower hero media ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}">
    </div>
  `).join('')
  dots.innerHTML = media.map((_, index) => `
    <button class="hero-dot${index === 0 ? ' active' : ''}" type="button" onclick="window.setHeroSlide(${index})" aria-label="Show slide ${index + 1}"></button>
  `).join('')

  if (media.length > 1 && currentPage === 'home') {
    heroSlideTimer = setInterval(() => {
      window.setHeroSlide((heroSlideIndex + 1) % media.length)
    }, 4500)
  }
}

window.setHeroSlide = function(index) {
  const slides = document.querySelectorAll('.hero-slide')
  const dots = document.querySelectorAll('.hero-dot')
  if (!slides.length) return
  heroSlideIndex = index
  slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === index))
  dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index))
}

function renderShowcaseGallery(images) {
  const container = document.getElementById('showcaseMarquee')
  if (!container) return
  const gallery = Array.isArray(images) ? images.filter(Boolean).slice(0, 10) : []
  if (!gallery.length) {
    container.innerHTML = '<div class="showcase-empty">Installation highlights will appear here soon.</div>'
    return
  }

  const cards = gallery.map((url, index) => `
    <div class="showcase-card">
      <img src="${esc(url)}" alt="Installation highlight ${index + 1}" loading="lazy">
    </div>
  `).join('')

  container.innerHTML = `
    <div class="showcase-track">${cards}</div>
    <div class="showcase-track" aria-hidden="true">${cards}</div>
  `
}

function renderTestimonials(items, targetId) {
  const container = document.getElementById(targetId)
  if (!container) return
  const list = Array.isArray(items) ? items.filter(item => item && (item.quote || item.name)) : []
  if (!list.length) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>📝 No testimonials yet</h3><p>Add customer feedback from the admin dashboard.</p></div>'
    return
  }

  container.innerHTML = list.map(item => `
    <article class="testimonial-card">
      <div class="testimonial-rating">${'⭐️'.repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)))}</div>
      <p>"${esc(item.quote || '')}"</p>
      <div class="testimonial-meta">
        <strong>— ${esc(item.name || 'Customer')}</strong>
        <span>📍 ${esc(item.location || 'Kenya')}</span>
      </div>
    </article>
  `).join('')
}

function renderAbout() {
  const about = getAboutContent()
  const gallery = getSiteGallery()

  setEl('aboutEyebrow', about.eyebrow)
  setEl('aboutTitle', about.title)
  setEl('aboutIntro', about.intro)
  setEl('aboutStoryTitle', about.storyTitle)
  setEl('aboutStoryBody', about.storyBody)
  setEl('aboutCard1Title', about.card1Title)
  setEl('aboutCard1Body', about.card1Body)
  setEl('aboutCard2Title', about.card2Title)
  setEl('aboutCard2Body', about.card2Body)
  setEl('aboutCard3Title', about.card3Title)
  setEl('aboutCard3Body', about.card3Body)

  renderAboutMedia(about.videoUrl, gallery)
  renderAboutGallery(gallery)
  renderTestimonials(getTestimonials(), 'aboutTestimonialGrid')
}

function renderAboutMedia(videoUrl, gallery) {
  const container = document.getElementById('aboutMediaPanel')
  if (!container) return

  const media = Array.isArray(gallery) ? gallery.filter(Boolean) : []
  const primary = media[0]
  const secondary = media.slice(1, 3)
  const videoEmbed = buildVideoEmbed(videoUrl)

  const imageHtml = primary
    ? `
      <div class="about-media-main">
        <img src="${esc(primary)}" alt="TruePower showroom or installation" loading="lazy">
      </div>
      <div class="about-media-row">
        ${secondary.map((url, index) => `
          <div class="about-media-thumb">
            <img src="${esc(url)}" alt="Additional installation highlight ${index + 1}" loading="lazy">
          </div>
        `).join('')}
      </div>
    `
    : '<div class="empty-state"><h3>Project visuals coming soon</h3><p>Installation photos and video highlights will appear here soon.</p></div>'

  container.innerHTML = `
    ${imageHtml}
    ${videoEmbed ? `<div class="about-video-wrap">${videoEmbed}</div>` : ''}
  `
}

function buildVideoEmbed(videoUrl) {
  if (!videoUrl) return ''
  const cleanUrl = String(videoUrl).trim()
  if (!cleanUrl) return ''

  const youtubeMatch = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/i)
  if (youtubeMatch) {
    return `<iframe src="https://www.youtube.com/embed/${esc(youtubeMatch[1])}" title="TruePower video" loading="lazy" allowfullscreen></iframe>`
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(cleanUrl)) {
    return `<video src="${esc(cleanUrl)}" controls muted playsinline></video>`
  }

  return `<a class="btn btn-ghost" href="${esc(cleanUrl)}" target="_blank" rel="noreferrer">Open Video</a>`
}

function renderAboutGallery(images) {
  const container = document.getElementById('aboutGalleryGrid')
  if (!container) return
  const gallery = Array.isArray(images) ? images.filter(Boolean).slice(0, 6) : []
  if (!gallery.length) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>Gallery coming soon</h3><p>Recent installation photos will appear here soon.</p></div>'
    return
  }

  container.innerHTML = gallery.map((url, index) => `
    <div class="about-gallery-card">
      <img src="${esc(url)}" alt="Installation gallery image ${index + 1}" loading="lazy">
    </div>
  `).join('')
}

function renderShop() {
  let list = products
  if (currentFilter !== 'all') list = list.filter(p => p.cat === currentFilter)
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.desc||'').toLowerCase().includes(q) ||
      (p.catLabel||'').toLowerCase().includes(q)
    )
  }
  setEl('shopCount', list.length)
  const grid = document.getElementById('shopGrid')
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>No products found</h3><p>Try a different filter or search.</p></div>`
    return
  }
  grid.innerHTML = list.map(productCardHTML).join('')
}

function getFirstImage(p) {
  if (p.images && p.images.length > 0) return p.images[0]
  if (p.image_url) return p.image_url
  return null
}

function productCardHTML(p) {
  const badge = p.badge ? `<span class="badge badge-blue product-thumb-badge">${esc(p.badge)}</span>` : ''
  const firstImg = getFirstImage(p)
  const isWished = wishlistIds.has(Number(p.id))
  const wishButton = `
    <button
      class="wish-btn${isWished ? ' wished' : ''}"
      type="button"
      data-id="${p.id}"
      aria-label="${isWished ? 'Remove from wishlist' : 'Add to wishlist'}"
      aria-pressed="${isWished ? 'true' : 'false'}"
      title="${isWished ? 'Remove from wishlist' : 'Save to wishlist'}"
    >${isWished ? '♥' : '♡'}</button>
  `
  const thumb = firstImg
    ? `<img src="${esc(firstImg)}" alt="${esc(p.name)}" loading="lazy">`
    : `<span class="product-thumb-emoji">${p.emoji||'TP'}</span>`
  const colors = Array.isArray(p.colors) ? p.colors : []
  const colorDots = colors.length > 1
    ? `<div style="display:flex;gap:.3rem;margin-top:.4rem">${colors.map(c=>`<span title="${esc(c)}" style="width:12px;height:12px;border-radius:50%;background:${colorToCSS(c)};border:1.5px solid var(--border);display:inline-block"></span>`).join('')}</div>`
    : ''
  return `
  <div class="product-card" onclick="window.showDetail(${p.id})" style="cursor:pointer">
    <div class="product-thumb">${thumb}${badge}${wishButton}</div>
    <div class="product-body">
      <div class="product-cat">${esc(p.catLabel||'')}</div>
      <div class="product-name">${esc(p.name)}</div>
      <div class="product-desc">${esc(p.desc||'')}</div>
      ${colorDots}
      <div class="product-footer" style="margin-top:.6rem">
        <div class="product-price">KSh ${Number(p.price).toLocaleString()} <small>incl.</small></div>
        <button class="btn btn-primary btn-sm" type="button" onclick="event.stopPropagation();window.showDetail(${p.id})">View</button>
      </div>
    </div>
  </div>`
}

function updateWishlistButtonState(productId) {
  const wished = wishlistIds.has(Number(productId))
  document.querySelectorAll(`.wish-btn[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('wished', wished)
    btn.textContent = wished ? '♥' : '♡'
    btn.setAttribute('aria-pressed', wished ? 'true' : 'false')
    btn.setAttribute('aria-label', wished ? 'Remove from wishlist' : 'Add to wishlist')
    btn.setAttribute('title', wished ? 'Remove from wishlist' : 'Save to wishlist')
  })
}

function colorToCSS(name) {
  const map = {
    white:'#f5f5f5', black:'#1a1a1a', silver:'#c0c0c0', grey:'#888',
    gray:'#888', red:'#e53e3e', blue:'#3182ce', gold:'#d4a017',
    chrome:'#aaa', brown:'#8B5E3C', beige:'#f5f0e1'
  }
  return map[name.toLowerCase()] || '#ccc'
}

document.addEventListener('click', async e => {
  const btn = e.target.closest('.wish-btn')
  if (!btn) return

  e.preventDefault()
  e.stopPropagation()

  if (!await ensureBackend()) {
    alert(getBackendErrorMessage('save to wishlist'))
    return
  }

  const id = Number.parseInt(btn.dataset.id, 10)
  if (!Number.isFinite(id)) return

  const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
  if (!user) {
    alert('Sign in to save to wishlist')
    return
  }

  btn.disabled = true

  try {
    if (wishlistIds.has(id)) {
      await removeFromWishlist(id)
      wishlistIds.delete(id)
    } else {
      await addToWishlist(id)
      wishlistIds.add(id)
    }

    if (currentPage === 'wishlist') {
      await renderWishlist()
      return
    }

    updateWishlistButtonState(id)
  } catch (error) {
    alert(error.message || 'Could not update wishlist right now.')
  } finally {
    btn.disabled = false
  }
}, true)

window.setFilter = function(cat, btn) {
  currentFilter = cat
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat))
  renderShop()
}

window.searchShop = function(val) {
  searchQuery = val
  renderShop()
}

window.filterShop = function(cat) {
  window.goPage('shop')
  currentFilter = cat
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat))
  renderShop()
}

// ── DETAIL ────────────────────────────────────────────
let detailGalleryIndex = 0
let detailGalleryImages = []
let detailSelectedColor = ''
let detailCurrentProduct = null

window.showDetail = function(id) {
  const p = products.find(x => x.id === id)
  if (!p) return
  fromPage = currentPage
  detailCurrentProduct = p
  detailSelectedColor = ''

  // Build images array — prefer images[], fallback to image_url
  const imgs = (Array.isArray(p.images) && p.images.length > 0)
    ? p.images
    : (p.image_url ? [p.image_url] : [])
  detailGalleryImages = imgs
  detailGalleryIndex = 0

  const colors = Array.isArray(p.colors) ? p.colors.filter(Boolean) : []
  const feats = Array.isArray(p.features) ? p.features : []

  // Gallery HTML
  const galleryHTML = imgs.length > 0 ? `
    <div class="gallery-wrap">
      <div class="gallery-main" id="galleryMain">
        <img id="galleryMainImg" src="${esc(imgs[0])}" alt="${esc(p.name)}">
        ${imgs.length > 1 ? `
          <button class="gallery-nav-btn prev" id="galleryPrev" onclick="window.galleryNav(-1)" ${detailGalleryIndex===0?'disabled':''}>‹</button>
          <button class="gallery-nav-btn next" id="galleryNext" onclick="window.galleryNav(1)">›</button>
        ` : ''}
      </div>
      ${imgs.length > 1 ? `
        <div class="gallery-dots" id="galleryDots">
          ${imgs.map((_,i)=>`<button class="gallery-dot${i===0?' active':''}" onclick="window.galleryGoTo(${i})"></button>`).join('')}
        </div>
        <div class="gallery-thumbs" id="galleryThumbs">
          ${imgs.map((url,i)=>`
            <div class="gallery-thumb${i===0?' active':''}" onclick="window.galleryGoTo(${i})">
              <img src="${esc(url)}" alt="View ${i+1}">
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>` : `<div class="detail-thumb"><span style="font-size:5rem">${p.emoji||'TP'}</span></div>`

  // Color picker HTML
  const colorHTML = colors.length > 0 ? `
    <div class="color-picker-wrap">
      <div class="color-picker-label">Colour: <span id="selectedColorLabel">Select a colour</span></div>
      <div class="color-chips">
        ${colors.map(c => `<button class="color-chip" onclick="window.selectColor('${esc(c)}')" data-color="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
    </div>` : ''

  document.getElementById('detailContent').innerHTML = `
    <div>
      ${galleryHTML}
      <div class="detail-cat">${esc(p.catLabel||'')}</div>
      <h1 class="detail-name">${esc(p.name)}</h1>
      <div class="detail-meta">
        ${p.power?`<div class="detail-meta-item"><strong>${esc(p.power)}</strong>Power</div>`:''}
        ${p.model?`<div class="detail-meta-item"><strong>${esc(p.model)}</strong>Model</div>`:''}
        ${p.badge?`<div class="detail-meta-item"><span class="badge badge-blue">${esc(p.badge)}</span></div>`:''}
        ${imgs.length > 1?`<div class="detail-meta-item"><strong>${imgs.length}</strong>Photos</div>`:''}
      </div>
      <p class="detail-desc">${esc(p.desc||'')}</p>
      ${feats.length?`<ul class="detail-features">${feats.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`:''}
    </div>
    <div>
      <div class="card detail-sidebar-card">
        <div class="detail-price">KSh ${Number(p.price).toLocaleString()} <small>accessories incl.</small></div>
        ${colorHTML}
        <button class="btn btn-primary btn-full" style="margin:1rem 0 .65rem" id="detailOrderBtn" onclick="window.orderDetailProduct()">Order on WhatsApp</button>
        <button class="btn btn-ghost btn-full" onclick="window.goBack()">← Back</button>
      </div>
    </div>`

  window.goPage('detail')
}

window.galleryNav = function(dir) {
  const len = detailGalleryImages.length
  detailGalleryIndex = Math.max(0, Math.min(len - 1, detailGalleryIndex + dir))
  window.galleryGoTo(detailGalleryIndex)
}

window.galleryGoTo = function(i) {
  detailGalleryIndex = i
  const img = document.getElementById('galleryMainImg')
  const dots = document.querySelectorAll('.gallery-dot')
  const thumbs = document.querySelectorAll('.gallery-thumb')
  const prev = document.getElementById('galleryPrev')
  const next = document.getElementById('galleryNext')
  if (img) { img.style.opacity='0'; setTimeout(()=>{ img.src=detailGalleryImages[i]; img.style.opacity='1' },120) }
  dots.forEach((d,idx) => d.classList.toggle('active', idx===i))
  thumbs.forEach((t,idx) => t.classList.toggle('active', idx===i))
  if (prev) prev.disabled = i===0
  if (next) next.disabled = i===detailGalleryImages.length-1
}

window.selectColor = function(color) {
  detailSelectedColor = color
  document.querySelectorAll('.color-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.color === color)
  })
  const label = document.getElementById('selectedColorLabel')
  if (label) label.textContent = color
}

window.orderDetailProduct = function() {
  const p = detailCurrentProduct
  if (!p) return
  const colors = Array.isArray(p.colors) ? p.colors.filter(Boolean) : []
  if (colors.length > 0 && !detailSelectedColor) {
    // Prompt to pick a color
    const label = document.getElementById('selectedColorLabel')
    if (label) { label.textContent = 'Please choose a colour first'; label.style.color='var(--error)' }
    document.querySelectorAll('.color-chip').forEach(c => c.style.borderColor='var(--error)')
    setTimeout(() => {
      document.querySelectorAll('.color-chip').forEach(c => c.style.borderColor='')
      if (label) { label.textContent='Select a colour'; label.style.color='' }
    }, 2000)
    return
  }
  window.openWA(p.name, p.price, detailSelectedColor)
}

// ── AUTH ──────────────────────────────────────────────
window.doLogin = async function() {
  const email = document.getElementById('loginEmail').value.trim()
  const pw = document.getElementById('loginPassword').value
  const msg = document.getElementById('loginMsg')
  const btn = document.getElementById('loginBtn')
  if (!email || !pw) return showMsg(msg,'error','Please fill in both fields.')
  btn.textContent = 'Signing in…'; btn.disabled = true; clearMsg(msg)
  try {
    if (!await ensureBackendOrShow(msg, 'sign in')) return
    await login(email, pw)
    
    // Get the user session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Login failed - no user found')
    }
    
    // Check if user profile exists, if not create it
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (!existingProfile) {
      // Create profile for new user
      await supabase
        .from('profiles')
        .insert([{ 
          id: user.id, 
          email: user.email,
          role: 'user',
          created_at: new Date().toISOString()
        }])
    }
    
    // Check if user is admin (but don't block regular users!)
    const isUserAdmin = await isAdmin()
    
    if (isUserAdmin) {
      window.updateMobileMenuAdminLinks()
      showMsg(msg, 'success', 'Welcome Admin! Redirecting to dashboard…')
      setTimeout(() => window.goPage('admin'), 600)
    } else {
      // ✅ Regular users can login too!
      showMsg(msg, 'success', 'Login successful! Redirecting to shop…')
      setTimeout(() => window.goPage('shop'), 600)
    }
  } catch(e) {
    console.error('Login error:', e)
    showMsg(msg,'error',e.message || 'Login failed. Please check your credentials.')
    document.getElementById('loginPassword').value = ''
  } finally { btn.textContent = 'Sign in'; btn.disabled = false }
}

window.doLogout = async function() {
  await logout()
  wishlistIds = new Set()
  window.updateMobileMenuAdminLinks()
  window.goPage('home')
}

window.doRegister = async function() {
  const name = document.getElementById('regName').value.trim()
  const email = document.getElementById('regEmail').value.trim()
  const pw = document.getElementById('regPassword').value
  const msg = document.getElementById('regMsg')
  const btn = document.getElementById('regBtn')
  if (!name||!email||!pw) return showMsg(msg,'error','Please fill in all fields.')
  if (pw.length < 6) return showMsg(msg,'error','Password must be at least 6 characters.')
  btn.textContent = 'Creating…'; btn.disabled = true
  try {
    if (!await ensureBackendOrShow(msg, 'register')) return
    const { error } = await supabase.auth.signUp({
      email, password: pw,
      options: { data: { full_name: name } }
    })
    if (error) throw new Error(error.message)
    showMsg(msg,'success','✅ Account created! Check your email to confirm, then sign in.')
    document.getElementById('regName').value = ''
    document.getElementById('regEmail').value = ''
    document.getElementById('regPassword').value = ''
  } catch(e) { showMsg(msg,'error',e.message) }
  finally { btn.textContent='Create Account'; btn.disabled=false }
}

window.doForgot = async function() {
  const email = document.getElementById('forgotEmail').value.trim()
  const msg = document.getElementById('forgotMsg')
  const btn = document.getElementById('forgotBtn')
  if (!email) return showMsg(msg,'error','Enter your email address.')
  btn.textContent = 'Sending…'; btn.disabled = true
  try {
    if (!await ensureBackendOrShow(msg, 'send a reset email')) return
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname + '#login'
    })
    if (error) throw new Error(error.message)
    showMsg(msg,'success','✅ Reset link sent! Check your email inbox.')
  } catch(e) { showMsg(msg,'error',e.message) }
  finally { btn.textContent='Send Reset Link'; btn.disabled=false }
}

window.doChangePassword = async function() {
  const nw = document.getElementById('cpNew').value
  const cf = document.getElementById('cpConfirm').value
  const msg = document.getElementById('cpMsg')
  if (!nw||!cf) return showMsg(msg,'error','Fill in both fields.')
  if (nw.length<6) return showMsg(msg,'error','Minimum 6 characters.')
  if (nw!==cf) return showMsg(msg,'error','Passwords do not match.')
  try {
    if (!await ensureBackendOrShow(msg, 'change the password')) return
    await changePassword(nw)
    showMsg(msg,'success','✅ Password updated!')
    document.getElementById('cpNew').value = ''
    document.getElementById('cpConfirm').value = ''
  } catch(e) { showMsg(msg,'error',e.message) }
}

// ── ADMIN MANAGEMENT FUNCTIONS ──────────────────────
async function loadAdminList() {
  const container = document.getElementById('adminListContainer');
  if (!container) return;

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at, full_name')
      .eq('role', 'admin')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const currentUser = await supabase.auth.getUser();
    const currentEmail = currentUser.data.user?.email;

    if (!profiles || profiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No admin users found</h3>
          <p>Add your first administrator using the form below.</p>
        </div>
      `;
      return;
    }

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    container.innerHTML = `
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <div class="stat-card stat-card-admin" style="flex:1">
          <div class="stat-card-label">Total Admins</div>
          <div class="stat-card-num">${profiles.length}</div>
          <div class="stat-card-sub">With dashboard access</div>
        </div>
        <div class="stat-card" style="flex:1">
          <div class="stat-card-label">Total Users</div>
          <div class="stat-card-num">${totalUsers || profiles.length}</div>
          <div class="stat-card-sub">Registered customers</div>
        </div>
      </div>
      <div style="overflow-x: auto;">
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Admin Since</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${profiles.map(admin => `
              <tr>
                <td>
                  <div style="font-weight: 600;">${esc(admin.email)}</div>
                  ${admin.full_name ? `<div style="font-size: 0.75rem; color: var(--text-500);">${esc(admin.full_name)}</div>` : ''}
                </td>
                <td>
                  <span class="admin-badge admin-badge-regular">
                    Admin
                  </span>
                </td>
                <td style="font-size: 0.85rem;">${new Date(admin.created_at).toLocaleDateString()}</td>
                <td>
                  ${admin.email === currentEmail ? 
                    '<span class="badge badge-green">You</span>' : 
                    '<span class="badge badge-grey">Active</span>'
                  }
                </td>
                <td>
                  ${admin.email !== currentEmail ? `
                    <button class="btn btn-danger btn-sm" onclick="window.removeAdmin('${esc(admin.email)}')">Remove Admin</button>
                  ` : 
                    '<span style="font-size:0.75rem; color:var(--text-500);">Current user</span>'
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Error loading admins:', error);
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error loading admins</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

window.addAdmin = async function() {
  const email = document.getElementById('newAdminEmail').value.trim();
  const notes = document.getElementById('newAdminNotes').value.trim();
  const msg = document.getElementById('adminActionMsg');
  
  if (!email) {
    showMsg(msg, 'error', 'Please enter an email address');
    return;
  }

  const btn = event?.target;
  if (btn) btn.disabled = true;

  try {
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (userError || !user) {
      showMsg(msg, 'error', `User with email "${email}" not found. Make sure they have registered first.`);
      if (btn) btn.disabled = false;
      return;
    }

    if (user.role === 'admin') {
      showMsg(msg, 'info', `⚠️ ${email} is already an admin!`);
      if (btn) btn.disabled = false;
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (updateError) throw updateError;

    showMsg(msg, 'success', `✅ ${email} is now an administrator!`);
    
    document.getElementById('newAdminEmail').value = '';
    document.getElementById('newAdminNotes').value = '';
    
    loadAdminList();
    
    console.log(`Admin action: ${email} was made admin`);
    
  } catch (error) {
    console.error('Error adding admin:', error);
    showMsg(msg, 'error', error.message || 'Failed to add admin. Please try again.');
  } finally {
    if (btn) btn.disabled = false;
    setTimeout(() => clearMsg(msg), 3000);
  }
};

window.removeAdmin = async function(email) {
  if (!confirm(`⚠️ Are you sure you want to remove "${email}" as an administrator?\n\nThey will become a regular user and lose access to the admin dashboard.`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('email', email);

    if (error) throw error;

    const tempMsg = document.createElement('div');
    tempMsg.className = 'msg-box success';
    tempMsg.textContent = `✅ ${email} is no longer an admin`;
    document.querySelector('.admin-main').prepend(tempMsg);
    setTimeout(() => tempMsg.remove(), 3000);

    loadAdminList();
    
    if (document.getElementById('searchUserInput')?.value) {
      window.searchUsers();
    }
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

window.searchUsers = async function() {
  const searchTerm = document.getElementById('searchUserInput').value.trim().toLowerCase();
  const resultsContainer = document.getElementById('userSearchResults');
  
  if (!searchTerm) {
    resultsContainer.innerHTML = '';
    return;
  }

  resultsContainer.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at, full_name')
      .ilike('email', `%${searchTerm}%`)
      .limit(10);

    if (error) throw error;

    if (!users || users.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state" style="padding: 2rem;">
          <p>No users found with email containing "${searchTerm}"</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div style="margin-top: 1rem;">
        <div class="admin-panel-sub">Found ${users.length} user(s)</div>
        ${users.map(user => `
          <div class="user-search-result">
            <div class="admin-user-info">
              <div class="admin-user-email-mini">${esc(user.email)}</div>
              <div class="admin-user-meta">
                ${user.full_name ? `📛 ${esc(user.full_name)} | ` : ''}
                📅 Joined ${new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
            <div class="admin-user-actions">
              ${user.role === 'admin' ? 
                `<span class="badge badge-blue">Admin ✓</span>
                 <button class="btn btn-danger btn-sm" onclick="window.removeAdmin('${esc(user.email)}')">Remove</button>` :
                `<span class="badge badge-grey">User</span>
                 <button class="btn btn-primary btn-sm" onclick="document.getElementById('newAdminEmail').value='${esc(user.email)}'; document.getElementById('newAdminNotes').focus();">Make Admin</button>`
              }
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error searching users:', error);
    resultsContainer.innerHTML = `<div class="msg-box error">Error: ${error.message}</div>`;
  }
};

// ── ADMIN INIT ────────────────────────────────────────
async function initAdmin() {
  if (!await ensureBackend()) {
    window.goPage('login')
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.goPage('login'); return }
    const admin = await isAdmin()
    if (!admin) { await logout(); window.goPage('login'); return }
    document.getElementById('sidebarEmail').textContent = session.user.email

    // Refresh products
    try { products = await fetchProducts() } catch(e) {}
    try { settings = await fetchSettings() } catch(e) {}

    renderDashboard()
    renderAdminTable()
    loadHomepageEditor()
    loadWASettings()
  } catch (e) {
    console.warn('Admin init error:', e.message)
    window.goPage('login')
  }
}

window.adminNav = function(sec, btn) {
  document.querySelectorAll('.admin-sec').forEach(s => s.style.display = 'none')
  document.querySelectorAll('.admin-sidebar-link').forEach(b => b.classList.remove('active'))
  const el = document.getElementById(`sec-${sec}`)
  if (el) el.style.display = ''
  if (btn) btn.classList.add('active')
  if (sec === 'addproduct' && editingId === null) { resetForm() }
  if (sec === 'addproduct') renderMultiImgGrid()
  if (sec === 'adminusers') { loadAdminList() }
}

// ── DASHBOARD ─────────────────────────────────────────
function renderDashboard() {
  setEl('stTotal', products.length)
  setEl('stStandard', products.filter(p=>p.cat==='standard').length)
  setEl('stShower', products.filter(p=>p.cat==='showerhead').length)
  setEl('stPump', products.filter(p=>p.cat==='pump').length)

  const recent = [...products].reverse().slice(0,8)
  const container = document.getElementById('dashRecent')
  if (!recent.length) {
    container.innerHTML = '<div class="empty-state"><h3>No products yet</h3><p>Add your first product.</p></div>'
    return
  }
  container.innerHTML = `<div style="overflow-x:auto"><table>
    <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
    <tbody>${recent.map(p=>`
      <tr>
        <td>${p.image_url?`<img src="${esc(p.image_url)}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">`:'<div style="width:40px;height:40px;background:var(--blue-light);border-radius:6px;display:grid;place-items:center;font-size:1.1rem">'+(p.emoji||'TP')+'</div>'}</td>
        <td><strong>${esc(p.name)}</strong></td>
        <td><span class="badge badge-blue">${esc(p.catLabel||'')}</span></td>
        <td style="font-weight:600">KSh ${Number(p.price).toLocaleString()}</td>
        <td><div style="display:flex;gap:.4rem">
          <button class="btn btn-ghost btn-sm" onclick="window.startEdit(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="window.startDelete(${p.id},'${esc(p.image_url||'')}')">Delete</button>
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`
}

// ── PRODUCTS TABLE ────────────────────────────────────
function renderAdminTable() {
  let list = products
  if (adminCatFilter !== 'all') list = list.filter(p => p.cat === adminCatFilter)
  if (adminSearchQuery) {
    const q = adminSearchQuery.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.catLabel||'').toLowerCase().includes(q))
  }
  setEl('prodCount', list.length)
  const tbody = document.getElementById('productsTableBody')
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-500)">No products found</td></tr>'
    return
  }
  tbody.innerHTML = list.map(p=>`
    <tr>
      <td>${p.image_url?`<img src="${esc(p.image_url)}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid var(--border)">`:`<div style="width:48px;height:48px;background:var(--blue-light);border-radius:8px;display:grid;place-items:center;font-size:1.3rem">${p.emoji||'TP'}</div>`}</td>
      <td>
        <div style="font-weight:600;font-size:.875rem">${esc(p.name)}</div>
        <div style="font-size:.75rem;color:var(--text-500)">${esc((p.desc||'').substring(0,50))}…</div>
      </td>
      <td><span class="badge badge-blue">${esc(p.catLabel||'')}</span></td>
      <td style="font-weight:600">KSh ${Number(p.price).toLocaleString()}</td>
      <td>${esc(p.power||'—')}</td>
      <td>${p.badge?`<span class="badge badge-green">${esc(p.badge)}</span>`:'<span style="color:var(--text-300)">—</span>'}</td>
      <td>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-ghost btn-sm" onclick="window.startEdit(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="window.startDelete(${p.id},'${esc(p.image_url||'')}')">Delete</button>
        </div>
      </td>
    </tr>`).join('')
}

window.adminFilterCat = function(cat) {
  adminCatFilter = cat
  renderAdminTable()
}

window.adminSearchProducts = function(q) {
  adminSearchQuery = q
  renderAdminTable()
}

// ── MULTI IMAGE UPLOAD ────────────────────────────────
let pendingImageFiles = []   // new File objects to upload
let currentImageUrls = []    // already-uploaded URLs (editing) + pasted URLs

function renderMultiImgGrid() {
  const grid = document.getElementById('multiImgGrid')
  if (!grid) return
  const max = 5
  const items = currentImageUrls.map((url, i) => `
    <div class="multi-img-item">
      <img src="${esc(url)}" alt="Image ${i+1}">
      <button class="multi-img-remove" onclick="window.removeImg(${i})" title="Remove">✕</button>
      ${i===0?'<div class="multi-img-main-badge">MAIN</div>':''}
    </div>`).join('')
  const pendingItems = pendingImageFiles.map((f, i) => {
    const objUrl = URL.createObjectURL(f)
    const absIdx = currentImageUrls.length + i
    return `
    <div class="multi-img-item">
      <img src="${objUrl}" alt="Pending ${i+1}">
      <button class="multi-img-remove" onclick="window.removePendingImg(${i})" title="Remove">✕</button>
      ${absIdx===0?'<div class="multi-img-main-badge">MAIN</div>':''}
    </div>`}).join('')
  const addBtn = (currentImageUrls.length + pendingImageFiles.length) < max
    ? `<button class="add-img-btn" type="button" onclick="document.getElementById('imgFile').click()">
        <span style="font-size:1.4rem">📷</span>
        <span>Add photo</span>
       </button>` : ''
  grid.innerHTML = items + pendingItems + addBtn
}

window.removeImg = function(i) {
  currentImageUrls.splice(i, 1)
  renderMultiImgGrid()
}

window.removePendingImg = function(i) {
  pendingImageFiles.splice(i, 1)
  renderMultiImgGrid()
}

window.handleMultiImgSelect = function(input) {
  const max = 5
  const available = max - currentImageUrls.length - pendingImageFiles.length
  const files = Array.from(input.files).slice(0, available)
  pendingImageFiles.push(...files)
  input.value = ''
  renderMultiImgGrid()
}

window.addImgUrl = function() {
  const input = document.getElementById('fImgUrl')
  const url = input.value.trim()
  if (!url) return
  const max = 5
  if (currentImageUrls.length + pendingImageFiles.length >= max) {
    document.getElementById('uploadStatus').textContent = 'Max 5 images allowed.'
    return
  }
  currentImageUrls.push(url)
  input.value = ''
  renderMultiImgGrid()
}

// ── PRODUCT FORM ──────────────────────────────────────
window.startEdit = function(id) {
  const p = products.find(x => x.id === id)
  if (!p) return
  editingId = id
  pendingImageFiles = []
  // Populate currentImageUrls from images[] or fallback to image_url
  currentImageUrls = (Array.isArray(p.images) && p.images.length > 0)
    ? [...p.images]
    : (p.image_url ? [p.image_url] : [])

  setEl('formTitle','Edit Product','innerText')
  document.getElementById('fName').value = p.name||''
  document.getElementById('fCat').value = p.cat||''
  document.getElementById('fPrice').value = p.price||''
  document.getElementById('fPower').value = p.power||''
  document.getElementById('fModel').value = p.model||''
  document.getElementById('fColor').value = p.color||''
  document.getElementById('fEmoji').value = p.emoji||''
  document.getElementById('fBadge').value = p.badge||''
  document.getElementById('fDesc').value = p.desc||''
  document.getElementById('fFeatures').value = Array.isArray(p.features)?p.features.join('\n'):''
  const colorsEl = document.getElementById('fColors')
  if (colorsEl) colorsEl.value = Array.isArray(p.colors) ? p.colors.join(', ') : (p.color||'')
  document.getElementById('fImgUrl').value = ''
  renderMultiImgGrid()
  window.adminNav('addproduct', document.querySelector('[data-sec=addproduct]'))
  window.scrollTo(0,0)
}

function resetForm() {
  editingId = null
  newImageFile = null
  pendingImageFiles = []
  currentImageUrls = []
  setEl('formTitle','Add Product','innerText')
  ;['fName','fCat','fPrice','fPower','fModel','fColor','fEmoji','fBadge','fColors','fDesc','fFeatures','fImgUrl'].forEach(id=>{
    const el = document.getElementById(id)
    if(el) el.value=''
  })
  document.getElementById('uploadStatus').textContent = ''
  clearMsg(document.getElementById('formMsg'))
  renderMultiImgGrid()
}

window.cancelEdit = function() {
  resetForm()
  window.adminNav('products', document.querySelector('[data-sec=products]'))
}

window.submitProduct = async function() {
  const msg = document.getElementById('formMsg')
  const btn = document.getElementById('submitBtn')
  clearMsg(msg)

  const name = document.getElementById('fName').value.trim()
  const cat = document.getElementById('fCat').value
  const price = parseInt(document.getElementById('fPrice').value)
  const desc = document.getElementById('fDesc').value.trim()

  if (!name||!cat||!price||!desc) return showMsg(msg,'error','Name, category, price and description are required.')
  if (isNaN(price)||price<0) return showMsg(msg,'error','Enter a valid price.')

  btn.textContent='Saving…'; btn.disabled=true

  try {
    // Upload any pending image files
    let allImageUrls = [...currentImageUrls]
    if (pendingImageFiles.length > 0) {
      showMsg(msg,'info',`Uploading ${pendingImageFiles.length} image(s)…`)
      const uploaded = await uploadMultipleImages(pendingImageFiles, name)
      allImageUrls = [...allImageUrls, ...uploaded]
    }

    // Parse colors
    const colorsRaw = document.getElementById('fColors').value.trim()
    const colors = colorsRaw ? colorsRaw.split(',').map(s=>s.trim()).filter(Boolean) : []

    const payload = {
      name, cat, price, desc,
      image_url: allImageUrls[0] || null,   // keep for backward compat
      images: allImageUrls,
      colors,
      power: document.getElementById('fPower').value.trim()||null,
      model: document.getElementById('fModel').value.trim()||null,
      color: document.getElementById('fColor').value.trim()||null,
      emoji: document.getElementById('fEmoji').value.trim()||null,
      badge: document.getElementById('fBadge').value.trim()||null,
      features: document.getElementById('fFeatures').value.split('\n').map(s=>s.trim()).filter(Boolean)
    }

    if (editingId) {
      const updated = await updateProduct(editingId, payload)
      const idx = products.findIndex(p=>p.id===editingId)
      if (idx!==-1) products[idx]=updated
      showMsg(msg,'success','✅ Product updated!')
    } else {
      const created = await createProduct(payload)
      products.push(created)
      showMsg(msg,'success','✅ Product added! Add another or go to All Products.')
      resetForm()
    }
    renderDashboard()
    renderAdminTable()
  } catch(e) {
    showMsg(msg,'error',e.message)
  } finally { btn.textContent='Save Product'; btn.disabled=false }
}

// ── DELETE ────────────────────────────────────────────
window.startDelete = function(id, imageUrl) {
  pendingDeleteId = id
  pendingDeleteImageUrl = imageUrl||null
  document.getElementById('deleteOverlay').classList.add('open')
}

window.closeDeleteModal = function() {
  pendingDeleteId = null
  pendingDeleteImageUrl = null
  document.getElementById('deleteOverlay').classList.remove('open')
}

window.confirmDelete = async function() {
  if (!pendingDeleteId) return
  try {
    await deleteProduct(pendingDeleteId)
    if (pendingDeleteImageUrl) {
      try { await deleteProductImage(pendingDeleteImageUrl) } catch(e) {}
    }
    products = products.filter(p=>p.id!==pendingDeleteId)
    renderDashboard()
    renderAdminTable()
    window.closeDeleteModal()
  } catch(e) { alert('Error: '+e.message) }
}

// ── HOMEPAGE EDITOR ───────────────────────────────────
// ── WHATSAPP SETTINGS ─────────────────────────────────
function getMediaState(type) {
  if (type === 'hero') {
    return { urls: heroMediaUrls, pendingFiles: heroMediaPendingFiles, max: 4, containerId: 'heroSlidesEditor' }
  }
  return { urls: siteGalleryUrls, pendingFiles: siteGalleryPendingFiles, max: 10, containerId: 'siteGalleryEditor' }
}

function renderManagedMediaEditor(type) {
  const { urls, pendingFiles, containerId } = getMediaState(type)
  const container = document.getElementById(containerId)
  if (!container) return

  const uploaded = urls.map((url, index) => `
    <div class="managed-media-card">
      <img src="${esc(url)}" alt="${type} media ${index + 1}">
      <button class="managed-media-remove" type="button" onclick="window.removeManagedUrl('${type}', ${index})">Remove</button>
    </div>
  `).join('')

  const pending = pendingFiles.map((file, index) => {
    const preview = URL.createObjectURL(file)
    return `
      <div class="managed-media-card managed-media-card-pending">
        <img src="${preview}" alt="Pending ${type} media ${index + 1}">
        <button class="managed-media-remove" type="button" onclick="window.removeManagedPending('${type}', ${index})">Remove</button>
      </div>
    `
  }).join('')

  container.innerHTML = uploaded + pending || '<div class="form-hint">No media added yet.</div>'
}

window.handleManagedFiles = function(type, input) {
  const state = getMediaState(type)
  const available = state.max - state.urls.length - state.pendingFiles.length
  const files = Array.from(input.files).slice(0, available)
  if (type === 'hero') {
    heroMediaPendingFiles.push(...files)
  } else {
    siteGalleryPendingFiles.push(...files)
  }
  input.value = ''
  renderManagedMediaEditor(type)
}

window.addManagedUrl = function(type, inputId, statusId) {
  const input = document.getElementById(inputId)
  const status = document.getElementById(statusId)
  if (!input) return
  const value = input.value.trim()
  const state = getMediaState(type)
  if (!value) return
  if (state.urls.length + state.pendingFiles.length >= state.max) {
    if (status) status.textContent = `Max ${state.max} items allowed.`
    return
  }

  if (type === 'hero') {
    heroMediaUrls.push(value)
  } else {
    siteGalleryUrls.push(value)
  }
  input.value = ''
  if (status) status.textContent = ''
  renderManagedMediaEditor(type)
}

window.removeManagedUrl = function(type, index) {
  if (type === 'hero') {
    heroMediaUrls.splice(index, 1)
  } else {
    siteGalleryUrls.splice(index, 1)
  }
  renderManagedMediaEditor(type)
}

window.removeManagedPending = function(type, index) {
  if (type === 'hero') {
    heroMediaPendingFiles.splice(index, 1)
  } else {
    siteGalleryPendingFiles.splice(index, 1)
  }
  renderManagedMediaEditor(type)
}

function renderTestimonialsEditor() {
  const container = document.getElementById('testimonialEditor')
  if (!container) return
  container.innerHTML = testimonialsDraft.map((item, index) => `
    <div class="admin-stack-card">
      <div class="admin-stack-head">Testimonial ${index + 1}</div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-input" type="text" value="${esc(item.name || '')}" oninput="window.updateTestimonialField(${index}, 'name', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Location</label>
          <input class="form-input" type="text" value="${esc(item.location || '')}" oninput="window.updateTestimonialField(${index}, 'location', this.value)">
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Rating</label>
          <input class="form-input" type="number" min="1" max="5" value="${Math.max(1, Math.min(5, Number(item.rating) || 5))}" oninput="window.updateTestimonialField(${index}, 'rating', this.value)">
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" type="button" onclick="window.removeTestimonial(${index})">Remove</button>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label">Quote</label>
        <textarea class="form-textarea" rows="3" oninput="window.updateTestimonialField(${index}, 'quote', this.value)">${esc(item.quote || '')}</textarea>
      </div>
    </div>
  `).join('')
}

window.addTestimonial = function() {
  if (testimonialsDraft.length >= 20) return
  testimonialsDraft.push({ name: '', location: '', quote: '', rating: 5 })
  renderTestimonialsEditor()
}

window.removeTestimonial = function(index) {
  if (testimonialsDraft.length <= 0) return
  testimonialsDraft.splice(index, 1)
  renderTestimonialsEditor()
}

window.updateTestimonialField = function(index, field, value) {
  if (!testimonialsDraft[index]) return
  testimonialsDraft[index][field] = field === 'rating'
    ? Math.max(1, Math.min(5, Number(value) || 5))
    : value
}

async function uploadManagedMedia(existingUrls, pendingFiles, labelPrefix) {
  if (!pendingFiles.length) return [...existingUrls]
  const uploaded = await uploadSiteAssets(pendingFiles, labelPrefix)
  return [...existingUrls, ...uploaded]
}

async function loadHomepageEditor() {
  try {
    const hp = await fetchHomepage()
    if (hp) {
      document.getElementById('hpKicker').value = hp.hero_kicker||''
      document.getElementById('hpTitle').value = hp.hero_title||''
      document.getElementById('hpSubtitle').value = hp.hero_subtitle||''
      document.getElementById('hpProof1').value = hp.hero_proof1||''
      document.getElementById('hpProof2').value = hp.hero_proof2 || '4.9/5'
      document.getElementById('hpProof3').value = hp.hero_proof3 || 'Same Day'
      for(let i=1;i<=4;i++) {
        const icon = document.getElementById(`adminWhy${i}icon`)
        const title = document.getElementById(`adminWhy${i}title`)
        const desc = document.getElementById(`adminWhy${i}desc`)
        if(icon) icon.value = hp[`why${i}_icon`]||''
        if(title) title.value = hp[`why${i}_title`]||''
        if(desc) desc.value = hp[`why${i}_desc`]||''
      }
    }
  } catch(e) {}

  heroMediaUrls = [...parseJsonSetting(settings.home_media_json, [])]
  heroMediaPendingFiles = []
  siteGalleryUrls = [...parseJsonSetting(settings.site_gallery_json, [])]
  siteGalleryPendingFiles = []
  testimonialsDraft = getTestimonials().map(item => ({ ...item }))

  const about = getAboutContent()
  document.getElementById('aboutEyebrowInput').value = about.eyebrow || ''
  document.getElementById('aboutTitleInput').value = about.title || ''
  document.getElementById('aboutIntroInput').value = about.intro || ''
  document.getElementById('aboutStoryTitleInput').value = about.storyTitle || ''
  document.getElementById('aboutStoryBodyInput').value = about.storyBody || ''
  document.getElementById('aboutVideoUrlInput').value = about.videoUrl || ''
  document.getElementById('aboutCard1TitleInput').value = about.card1Title || ''
  document.getElementById('aboutCard1BodyInput').value = about.card1Body || ''
  document.getElementById('aboutCard2TitleInput').value = about.card2Title || ''
  document.getElementById('aboutCard2BodyInput').value = about.card2Body || ''
  document.getElementById('aboutCard3TitleInput').value = about.card3Title || ''
  document.getElementById('aboutCard3BodyInput').value = about.card3Body || ''

  renderManagedMediaEditor('hero')
  renderManagedMediaEditor('gallery')
  renderTestimonialsEditor()
}

window.saveHomepageSection = async function(section) {
  if (section === 'hero') {
    const msg = document.getElementById('heroMsg')
    try {
      const heroMedia = await uploadManagedMedia(heroMediaUrls, heroMediaPendingFiles, 'hero-slide')
      await Promise.all([
        saveHomepage({
          hero_kicker: document.getElementById('hpKicker').value,
          hero_title: document.getElementById('hpTitle').value,
          hero_subtitle: document.getElementById('hpSubtitle').value,
          hero_proof1: document.getElementById('hpProof1').value || '22+',
          hero_proof2: document.getElementById('hpProof2').value || '4.9/5',
          hero_proof3: document.getElementById('hpProof3').value || 'Same Day'
        }),
        saveSetting('home_media_json', JSON.stringify(heroMedia))
      ])
      heroMediaUrls = [...heroMedia]
      heroMediaPendingFiles = []
      settings.home_media_json = JSON.stringify(heroMedia)
      renderManagedMediaEditor('hero')
      renderHome()
      showMsg(msg,'success','Hero section saved.')
    } catch(e) { showMsg(msg,'error',e.message) }
  }
  if (section === 'why') {
    const msg = document.getElementById('whyMsg')
    try {
      const payload = {}
      for(let i=1;i<=4;i++) {
        payload[`why${i}_icon`] = document.getElementById(`adminWhy${i}icon`).value
        payload[`why${i}_title`] = document.getElementById(`adminWhy${i}title`).value
        payload[`why${i}_desc`] = document.getElementById(`adminWhy${i}desc`).value
      }
      await saveHomepage(payload)
      // Also refresh settings and re-render home so the cards update live
      try { settings = await fetchSettings() } catch(e) {}
      renderHome()
      showMsg(msg,'success','Why cards saved.')
    } catch(e) { showMsg(msg,'error',e.message) }
  }
  if (section === 'testimonials') {
    const msg = document.getElementById('testimonialsMsg')
    try {
      const clean = testimonialsDraft
        .map(item => ({
          name: (item.name || '').trim(),
          location: (item.location || '').trim(),
          quote: (item.quote || '').trim(),
          rating: Math.max(1, Math.min(5, Number(item.rating) || 5))
        }))
        .filter(item => item.name || item.location || item.quote)
      const finalList = clean.length ? clean : DEFAULT_TESTIMONIALS
      await saveSetting('testimonials_json', JSON.stringify(finalList))
      settings.testimonials_json = JSON.stringify(finalList)
      testimonialsDraft = finalList.map(item => ({ ...item }))
      renderTestimonialsEditor()
      renderHome()
      renderAbout()
      showMsg(msg,'success','Testimonials saved.')
    } catch(e) { showMsg(msg,'error',e.message) }
  }
  if (section === 'gallery') {
    const msg = document.getElementById('galleryMsg')
    try {
      const gallery = await uploadManagedMedia(siteGalleryUrls, siteGalleryPendingFiles, 'site-gallery')
      await saveSetting('site_gallery_json', JSON.stringify(gallery))
      siteGalleryUrls = [...gallery]
      siteGalleryPendingFiles = []
      settings.site_gallery_json = JSON.stringify(gallery)
      renderManagedMediaEditor('gallery')
      renderHome()
      renderAbout()
      showMsg(msg,'success','Gallery saved.')
    } catch(e) { showMsg(msg,'error',e.message) }
  }
  if (section === 'about') {
    const msg = document.getElementById('aboutMsg')
    try {
      const payload = {
        eyebrow: document.getElementById('aboutEyebrowInput').value.trim(),
        title: document.getElementById('aboutTitleInput').value.trim(),
        intro: document.getElementById('aboutIntroInput').value.trim(),
        storyTitle: document.getElementById('aboutStoryTitleInput').value.trim(),
        storyBody: document.getElementById('aboutStoryBodyInput').value.trim(),
        videoUrl: document.getElementById('aboutVideoUrlInput').value.trim(),
        card1Title: document.getElementById('aboutCard1TitleInput').value.trim(),
        card1Body: document.getElementById('aboutCard1BodyInput').value.trim(),
        card2Title: document.getElementById('aboutCard2TitleInput').value.trim(),
        card2Body: document.getElementById('aboutCard2BodyInput').value.trim(),
        card3Title: document.getElementById('aboutCard3TitleInput').value.trim(),
        card3Body: document.getElementById('aboutCard3BodyInput').value.trim()
      }
      await saveSetting('about_content_json', JSON.stringify(payload))
      settings.about_content_json = JSON.stringify(payload)
      renderAbout()
      showMsg(msg,'success','About page saved.')
    } catch(e) { showMsg(msg,'error',e.message) }
  }
}

async function loadWASettings() {
  try {
    document.getElementById('waNumber').value = settings.wa_number||''
    document.getElementById('waMessage').value = settings.wa_message||''
  } catch(e) {}
}

window.saveWASettings = async function() {
  const msg = document.getElementById('waMsg')
  const number = document.getElementById('waNumber').value.trim()
  const message = document.getElementById('waMessage').value.trim()
  if (!number) return showMsg(msg,'error','Enter a WhatsApp number.')
  try {
    await Promise.all([
      saveSetting('wa_number', number),
      saveSetting('wa_message', message)
    ])
    settings.wa_number = number
    settings.wa_message = message
    showMsg(msg,'success','✅ WhatsApp settings saved!')
  } catch(e) { showMsg(msg,'error',e.message) }
}

// ── TESTIMONIAL SCROLL ───────────────────────────────
let testimonialAutoScrollTimer = null

window.scrollTestimonials = function(section, dir) {
  const id = section === 'home' ? 'testimonialGrid' : 'aboutTestimonialGrid'
  const el = document.getElementById(id)
  if (!el) return
  const cardWidth = 356
  el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' })
}

function startTestimonialAutoScroll() {
  if (testimonialAutoScrollTimer) clearInterval(testimonialAutoScrollTimer)
  testimonialAutoScrollTimer = setInterval(() => {
    const el = document.getElementById('testimonialGrid')
    if (!el) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10
    if (atEnd) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: 356, behavior: 'smooth' })
    }
  }, 3500)
}

function stopTestimonialAutoScroll() {
  if (testimonialAutoScrollTimer) {
    clearInterval(testimonialAutoScrollTimer)
    testimonialAutoScrollTimer = null
  }
}

// ── WHATSAPP FLOAT ────────────────────────────────────
window.openWA = function(productName, price, color) {
  const num = settings.wa_number || '254700000000'
  const defaultMsg = settings.wa_message || "Hi! I'm interested in your water heaters."
  let msg = defaultMsg
  if (productName) {
    const colorPart = color ? `, *Colour: ${color}*` : ''
    msg = `Hi! I'd like to order the *${productName}*${colorPart} — priced at KSh ${Number(price).toLocaleString()}. Is it available?`
  }
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
}

// ── HELPERS ───────────────────────────────────────────
function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;')
}

function setEl(id, val, prop = 'textContent') {
  const el = document.getElementById(id)
  if (el && val != null) el[prop] = val
}

function showMsg(el, type, text) {
  if (!el) return
  el.className = `msg-box ${type}`
  el.textContent = text
}

function clearMsg(el) {
  if (el) { el.className='msg-box'; el.textContent='' }
}

window.togglePw = function(inputId, btn) {
  const input = document.getElementById(inputId)
  if (!input) return
  const show = input.type==='password'
  input.type = show ? 'text' : 'password'
  btn.textContent = show ? 'Hide' : 'Show'
}

// Click outside modal
document.getElementById('deleteOverlay').addEventListener('click', function(e) {
  if (e.target===this) window.closeDeleteModal()
})

boot()
