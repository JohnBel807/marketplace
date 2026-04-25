import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, TrendingUp, Shield, Zap } from 'lucide-react'
import { useListingsStore } from '../context/store'
import ListingCard from '../components/marketplace/ListingCard'
import ListingCardSkeleton from '../components/marketplace/ListingCardSkeleton'
import { CATEGORIES, MUNICIPALITIES } from '../utils/constants'
import { usePageSEO } from '../hooks/usePageSEO'

export default function HomePage() {
  usePageSEO({
    title: 'El mercado local de tu región',
    description: 'Compra y vende vehículos, maquinaria agrícola, ganado, repuestos y mucho más en Vélez y Ricaurte, Santander. El marketplace local de la provincia.',
    url: 'https://www.velezyricaurte.info',
  })
  const [search, setSearch] = useState('')
  const [heroCity, setHeroCity] = useState('')
  const navigate = useNavigate()
  const { featured, fetchFeatured, isLoading } = useListingsStore()

  useEffect(() => { fetchFeatured() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (heroCity) params.set('city', heroCity)
    navigate(`/listings?${params}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-earth-900 via-earth-800 to-brand-900 text-white overflow-hidden">
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-sm text-brand-200 px-4 py-1.5 rounded-full mb-6 border border-white/10">
              <MapPin size={14} /> Provincia de Vélez, Santander
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              El mercado local<br />
              <span className="text-brand-400">de tu región</span>
            </h1>
            <p className="text-earth-300 text-lg md:text-xl mb-8 leading-relaxed">
              Compra y vende vehículos, maquinaria, ganado, repuestos y mucho más. Todo en un solo lugar, para Vélez y Ricaurte.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="¿Qué estás buscando?"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-earth-900 placeholder-earth-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                />
              </div>
              <select
                value={heroCity}
                onChange={(e) => setHeroCity(e.target.value)}
                className="sm:w-44 px-4 py-3.5 rounded-xl text-earth-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              >
                <option value="">Todos los municipios</option>
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button type="submit" className="btn-primary py-3.5 px-7 justify-center">
                Buscar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="section-title mb-6">Explorar por categoría</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.key}
              onClick={() => navigate(`/listings?category=${cat.key}`)}
              className={`card p-4 text-center hover:-translate-y-1 transition-all duration-200 cursor-pointer animate-fade-up border ${cat.color.replace('bg-', 'hover:bg-').replace('text-', '')}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="text-xs font-semibold text-earth-700 leading-tight">{cat.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Anuncios destacados</h2>
          <button onClick={() => navigate('/listings?featured=true')} className="text-brand-600 text-sm font-semibold hover:underline">
            Ver todos →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : featured.length > 0
              ? featured.map(l => <ListingCard key={l.id} listing={l} />)
              : (
                <div className="col-span-full text-center py-16 text-earth-400">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="font-medium">Aún no hay anuncios destacados</p>
                  <p className="text-sm mt-1">¡Sé el primero en publicar!</p>
                </div>
              )
          }
        </div>
      </section>

      {/* Why */}
      <section className="bg-earth-50 border-y border-earth-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="section-title text-center mb-10">¿Por qué VelezYRicaurte?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin className="text-brand-500" size={28} />, title: 'Local y cercano', desc: 'Anuncios de tu misma región. Sin intermediarios ni costos de envío lejanos.' },
              { icon: <Shield className="text-brand-500" size={28} />, title: 'Vendedores verificados', desc: 'Los planes Pro y Premium incluyen badge de verificación para mayor confianza.' },
              { icon: <Zap className="text-brand-500" size={28} />, title: 'Fácil y rápido', desc: 'Publica en minutos. El comprador te contacta directo por WhatsApp.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center px-4">
                <div className="flex justify-center mb-4">{icon}</div>
                <h3 className="font-display font-semibold text-xl text-earth-900 mb-2">{title}</h3>
                <p className="text-earth-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-3xl p-10 text-white">
          <TrendingUp size={40} className="mx-auto mb-4 opacity-80" />
          <h2 className="font-display text-3xl font-bold mb-3">¿Tienes algo para vender?</h2>
          <p className="text-brand-100 mb-6 max-w-md mx-auto">Publica tu primer anuncio desde $19.900/mes y llega a toda la región.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/pricing" className="bg-white text-brand-700 font-bold px-7 py-3 rounded-xl hover:bg-brand-50 transition-colors">
              Ver planes
            </a>
            <a href="/register" className="bg-brand-400/30 hover:bg-brand-400/50 text-white font-bold px-7 py-3 rounded-xl border border-white/20 transition-colors">
              Crear cuenta gratis
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
