import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useListingsStore } from '../context/store'
import ListingCard from '../components/marketplace/ListingCard'
import ListingCardSkeleton from '../components/marketplace/ListingCardSkeleton'
import CategoryFilter from '../components/marketplace/CategoryFilter'
import { MUNICIPALITIES, formatNumber } from '../utils/constants'
import { usePageSEO, CATEGORY_SEO } from '../hooks/usePageSEO'

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const { listings, total, page, isLoading, filters, setFilter, resetFilters, fetchListings } = useListingsStore()
  const category = searchParams.get('category') || ''
  const catSEO = CATEGORY_SEO[category] || {}
  usePageSEO({
    title: catSEO.title || 'Explorar anuncios',
    description: catSEO.description || 'Encuentra lo que buscas en la provincia de Vélez y Ricaurte, Santander.',
    url: `https://www.velezyricaurte.info/listings${category ? `?category=${category}` : ''}`,
  })

  // Sync URL params → store filters on mount
  useEffect(() => {
    const cat = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    if (cat) setFilter('category', cat)
    if (search) setFilter('search', search)
    if (city) setFilter('city', city)
    fetchListings(true)
  }, [])

  const applyFilter = (key, value) => {
    setFilter(key, value)
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)
    setSearchParams(newParams)
    setTimeout(() => fetchListings(true), 50)
  }

  const hasMore = listings.length < total

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Explorar anuncios</h1>
        <p className="text-earth-400 text-sm">{formatNumber(total)} anuncios en la región</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => applyFilter('search', e.target.value)}
            placeholder="Buscar en todos los anuncios..."
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${showFilters ? 'border-brand-400 text-brand-600' : ''}`}
        >
          <SlidersHorizontal size={16} /> Filtros
        </button>
        {(filters.category || filters.city || filters.min_price || filters.max_price) && (
          <button onClick={() => { resetFilters(); fetchListings(true) }} className="btn-ghost text-red-500 hover:bg-red-50">
            <X size={16} /> Limpiar
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="mb-4">
        <CategoryFilter selected={filters.category} onChange={(v) => applyFilter('category', v)} />
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Municipio</label>
            <select className="input" value={filters.city} onChange={(e) => applyFilter('city', e.target.value)}>
              <option value="">Todos los municipios</option>
              {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Precio mínimo (COP)</label>
            <input type="number" className="input" placeholder="0" value={filters.min_price}
              onChange={(e) => applyFilter('min_price', e.target.value)} />
          </div>
          <div>
            <label className="label">Precio máximo (COP)</label>
            <input type="number" className="input" placeholder="Sin límite" value={filters.max_price}
              onChange={(e) => applyFilter('max_price', e.target.value)} />
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading && listings.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 text-earth-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-display text-xl text-earth-600 mb-2">Sin resultados</p>
          <p className="text-sm">Intenta con otros filtros o términos de búsqueda</p>
          <button onClick={() => { resetFilters(); fetchListings(true) }} className="btn-secondary mt-4">
            Ver todos los anuncios
          </button>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={listings.length}
          next={() => fetchListings(false)}
          hasMore={hasMore}
          loader={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
              {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          }
          endMessage={
            <p className="text-center text-earth-400 text-sm mt-8 pb-4">
              ✓ Has visto todos los anuncios ({formatNumber(total)})
            </p>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}
