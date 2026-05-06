import { useEffect } from 'react'

const SITE_URL = 'https://truepower.co.ke'
const DEFAULT_TITLE = 'TruePower Kenya | Water Heaters, Solar & Electrical Solutions'
const DEFAULT_DESCRIPTION = 'Shop water heaters, pumps, solar solutions, lighting and electrical gear in Kenya. TruePower helps homes with borehole water, salty water, and low water pressure.'
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`

function ensureMeta(selector, attributes = {}) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })

  return element
}

function ensureLink(selector, attributes = {}) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })

  return element
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | TruePower Kenya` : DEFAULT_TITLE
    const canonicalUrl = new URL(path, SITE_URL).toString()

    document.title = fullTitle

    ensureMeta('meta[name="description"]', { name: 'description', content: description })
    ensureMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    })

    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'TruePower Kenya' })

    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    ensureLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl })

    let script = document.head.querySelector('script[data-seo-jsonld="true"]')
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.dataset.seoJsonld = 'true'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }

    return () => {
      if (document.title === fullTitle) {
        document.title = DEFAULT_TITLE
      }
    }
  }, [description, image, jsonLd, noindex, path, title])

  return null
}

export { SITE_URL, DEFAULT_IMAGE, DEFAULT_DESCRIPTION }
