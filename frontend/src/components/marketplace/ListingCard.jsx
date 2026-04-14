import { Link } from 'react-router-dom'
import { Eye, MapPin, Star, MessageCircle } from 'lucide-react'
import { formatPrice, timeAgo, getCategoryMeta, PLACEHOLDER_IMAGES } from '../../utils/constants'

export default function ListingCard({ listing }) {
  const cat = getCategoryMeta(listing.category)
  const img = listing.thumbnail_url
    || listing.photos?.[0]
    || PLACEHOLDER_IMAGES[listing.category]?.[0]
    || PLACEHOLDER_IMAGES.default

  const waMsg = `Hola, vi tu anuncio "${listing.title}" en VelezYRicaurte.com y me interesa. ¿Está disponible?`
  const waUrl = `https://wa.me/${listing.contact_whatsapp || '573001234567'}?text=${encodeURIComponent(waMsg)}`

  return (
    <article className="card group overflow-hidden flex flex-col">
      {/* Image */}
      <Link to={`/listings/${listing.id}`} className="block relative overflow-hidden aspect-[4/3]">
        <img
          src={img}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGES.default }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <span className={`badge border ${cat.color} text-xs`}>{cat.icon} {cat.label}</span>
          {listing.is_featured && (
            <span className="badge bg-amber-400 text-amber-900 border border-amber-300">
              <Star size={10} fill="currentColor" /> Destacado
            </span>
          )}
        </div>
        {listing.condition === 'new' && (
          <span className="absolute top-2 right-2 badge bg-green-500 text-white">Nuevo</span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/listings/${listing.id}`}>
          <h3 className="font-semibold text-earth-900 text-sm leading-snug line-clamp-2 hover:text-brand-600 transition-colors mb-1">
            {listing.title}
          </h3>
        </Link>

        <p className="font-display text-xl font-bold text-brand-600 mt-1 mb-2">
          {formatPrice(listing.price)}
          {listing.price_negotiable && <span className="text-xs text-earth-400 font-body font-normal ml-1">(negociable)</span>}
        </p>

        <div className="flex items-center gap-1 text-xs text-earth-400 mb-3">
          <MapPin size={12} />
          <span>{listing.city}{listing.municipality && ` · ${listing.municipality}`}</span>
          <span className="ml-auto">{timeAgo(listing.created_at)}</span>
        </div>

        {/* Attributes preview */}
        {listing.attributes && Object.keys(listing.attributes).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(listing.attributes).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-[11px] bg-earth-100 text-earth-600 px-2 py-0.5 rounded-full">
                {v}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3 border-t border-earth-50">
          <div className="flex items-center gap-1 text-xs text-earth-400">
            <Eye size={12} />
            <span>{listing.views_count}</span>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <MessageCircle size={13} /> WhatsApp
          </a>
          <Link
            to={`/listings/${listing.id}`}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Ver más
          </Link>
        </div>
      </div>
    </article>
  )
}
