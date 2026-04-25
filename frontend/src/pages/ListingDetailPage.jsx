import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Eye, MessageCircle, Phone, Share2, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react'
import api from '../utils/api'
import { formatPrice, timeAgo, getCategoryMeta, PLACEHOLDER_IMAGES } from '../utils/constants'
import { usePageSEO, getListingSEO } from '../hooks/usePageSEO'

export default function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  const seoProps = getListingSEO(listing)
  usePageSEO(listing ? seoProps : {})

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => setListing(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="skeleton h-80 w-full rounded-2xl" />
      <div className="skeleton h-8 w-2/3" />
      <div className="skeleton h-6 w-1/4" />
    </div>
  )

  if (!listing) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">😕</p>
      <p className="font-display text-xl text-earth-700 mb-2">Anuncio no encontrado</p>
      <Link to="/listings" className="btn-primary mt-4">Ver anuncios</Link>
    </div>
  )

  const cat = getCategoryMeta(listing.category)
  const images = listing.photos?.length > 0
    ? listing.photos
    : [PLACEHOLDER_IMAGES[listing.category]?.[0] || PLACEHOLDER_IMAGES.default]

  const waMsg = `Hola, vi tu anuncio "${listing.title}" en VelezYRicaurte.com (ID: ${listing.id}). ¿Está disponible?`
  const waUrl = `https://wa.me/${listing.contact_whatsapp || listing.contact_phone || '573001234567'}?text=${encodeURIComponent(waMsg)}`

  const share = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-earth-400 mb-6">
        <Link to="/" className="hover:text-earth-700">Inicio</Link>
        <span>/</span>
        <Link to="/listings" className="hover:text-earth-700">Anuncios</Link>
        <span>/</span>
        <Link to={`/listings?category=${listing.category}`} className="hover:text-earth-700">{cat.label}</Link>
        <span>/</span>
        <span className="text-earth-600 truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: images + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="card overflow-hidden">
            <div className="relative aspect-[16/10] bg-earth-100">
              <img
                src={images[imgIdx]}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGES.default }}
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white">
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
              {listing.is_featured && (
                <span className="absolute top-3 left-3 badge bg-amber-400 text-amber-900">
                  <Star size={10} fill="currentColor" /> Destacado
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-brand-500' : 'border-transparent'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.src = PLACEHOLDER_IMAGES.default }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-earth-900 mb-3">Descripción</h2>
            <p className="text-earth-600 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Attributes */}
          {listing.attributes && Object.keys(listing.attributes).length > 0 && (
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-earth-900 mb-4">Características</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(listing.attributes).map(([k, v]) => (
                  <div key={k} className="bg-earth-50 rounded-xl p-3">
                    <dt className="text-xs text-earth-400 capitalize mb-0.5">{k.replace(/_/g, ' ')}</dt>
                    <dd className="font-semibold text-earth-800 text-sm">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Right: price + contact */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="card p-6 sticky top-20">
            <div className="flex items-start justify-between mb-2">
              <span className={`badge border ${cat.color}`}>{cat.icon} {cat.label}</span>
              <button onClick={share} className="btn-ghost text-xs p-1.5">
                <Share2 size={15} /> {copied ? '¡Copiado!' : 'Compartir'}
              </button>
            </div>

            <h1 className="font-display text-xl font-bold text-earth-900 mt-3 mb-2">{listing.title}</h1>

            <p className="font-display text-3xl font-bold text-brand-600 mb-1">
              {formatPrice(listing.price)}
            </p>
            {listing.price_negotiable && (
              <p className="text-xs text-earth-400 mb-4">Precio negociable</p>
            )}

            <div className="space-y-2 text-sm text-earth-500 mb-5">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-400" />
                <span>{listing.city}{listing.municipality ? `, ${listing.municipality}` : ''}, {listing.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-brand-400" />
                <span>Publicado {timeAgo(listing.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-brand-400" />
                <span>{listing.views_count} visitas</span>
              </div>
            </div>

            <div className="space-y-2">
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
                <MessageCircle size={18} /> Contactar por WhatsApp
              </a>
              {listing.contact_phone && (
                <a href={`tel:${listing.contact_phone}`}
                  className="flex items-center justify-center gap-2 w-full btn-secondary py-3 justify-center">
                  <Phone size={16} /> Llamar
                </a>
              )}
              {/* TraeNos */}
              <a
                href={`https://traenos.velezyricaurte.com?utm_source=info&utm_medium=listing&utm_content=${listing.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-colors border-2"
                style={{background:'#f0f7ff', borderColor:'#1e3a5f', color:'#1e3a5f'}}
              >
                🛵 Solicitar envío con TraeNos
              </a>
            </div>

            <hr className="my-4 border-earth-100" />

            {/* Seller */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                {listing.owner?.full_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-earth-800 text-sm">{listing.owner?.full_name}</p>
                <p className="text-xs text-earth-400">{listing.owner?.city}, Santander</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
