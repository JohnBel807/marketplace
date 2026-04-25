import { useEffect } from 'react'

const DEFAULT = {
  title: 'VelezYRicaurte.info — Marketplace Regional',
  description: 'El marketplace local de la provincia de Vélez, Santander. Vehículos, maquinaria, ganado, empleos, servicios y más.',
  image: 'https://www.velezyricaurte.info/og-image.png',
  url: 'https://www.velezyricaurte.info',
}

export function usePageSEO({ title, description, image, url, type = 'website' } = {}) {
  useEffect(() => {
    const t = title ? `${title} | VelezYRicaurte.info` : DEFAULT.title
    const d = description || DEFAULT.description
    const img = image || DEFAULT.image
    const u = url || DEFAULT.url

    // Title
    document.title = t

    // Helper to set meta tag
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const [attrName, attrValue] = selector.replace('meta[', '').replace(']', '').split('="')
        el.setAttribute(attrName, attrValue.replace('"', ''))
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    setMeta('meta[name="description"]', 'content', d)
    setMeta('meta[property="og:title"]', 'content', t)
    setMeta('meta[property="og:description"]', 'content', d)
    setMeta('meta[property="og:image"]', 'content', img)
    setMeta('meta[property="og:url"]', 'content', u)
    setMeta('meta[property="og:type"]', 'content', type)
    setMeta('meta[name="twitter:title"]', 'content', t)
    setMeta('meta[name="twitter:description"]', 'content', d)
    setMeta('meta[name="twitter:image"]', 'content', img)

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', u)

    // Cleanup — reset to default on unmount
    return () => {
      document.title = DEFAULT.title
      setMeta('meta[name="description"]', 'content', DEFAULT.description)
      setMeta('meta[property="og:title"]', 'content', DEFAULT.title)
      setMeta('meta[property="og:description"]', 'content', DEFAULT.description)
      setMeta('meta[property="og:url"]', 'content', DEFAULT.url)
    }
  }, [title, description, image, url, type])
}

// Helper para generar SEO de un anuncio
export function getListingSEO(listing) {
  if (!listing) return {}
  const category = listing.category || ''
  const city = listing.city || 'Vélez'
  const price = listing.price
    ? `$${new Intl.NumberFormat('es-CO').format(listing.price)}`
    : 'Precio a convenir'

  return {
    title: listing.title,
    description: `${listing.title} en ${city}, Santander. ${price}. ${listing.description?.substring(0, 100)}...`,
    image: listing.thumbnail_url || listing.photos?.[0] || 'https://www.velezyricaurte.info/og-image.png',
    url: `https://www.velezyricaurte.info/listings/${listing.id}`,
    type: 'product',
  }
}

// SEO por categoría
export const CATEGORY_SEO = {
  vehiculos: {
    title: 'Vehículos en venta — Vélez y Ricaurte',
    description: 'Carros, motos, camionetas y vehículos eléctricos en venta en la provincia de Vélez, Santander.',
  },
  maquinaria: {
    title: 'Maquinaria Agrícola — Vélez Santander',
    description: 'Tractores, cosechadoras, fumigadoras y maquinaria agrícola usada en la región de Vélez.',
  },
  ganado: {
    title: 'Ganado y Animales — Vélez Santander',
    description: 'Bovinos, porcinos, equinos y aves de corral en venta en Vélez y Ricaurte, Santander.',
  },
  electrodomesticos: {
    title: 'Electrodomésticos y Tecnología — Vélez',
    description: 'Neveras, lavadoras, televisores, celulares y computadores usados en Vélez, Santander.',
  },
  empleos: {
    title: 'Empleos en Vélez y Ricaurte, Santander',
    description: 'Ofertas de trabajo en agricultura, construcción, comercio y servicios en la provincia de Vélez.',
  },
  servicios: {
    title: 'Servicios Locales — Vélez Santander',
    description: 'Mecánica, construcción, electricidad, plomería y más servicios en Vélez y Ricaurte.',
  },
  repuestos: {
    title: 'Repuestos para Vehículos y Motos — Vélez',
    description: 'Motor, frenos, suspensión, llantas y repuestos usados en Vélez, Santander.',
  },
}
