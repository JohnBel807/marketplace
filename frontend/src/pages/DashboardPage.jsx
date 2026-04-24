import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Eye, Edit2, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import api from '../utils/api'
import { useAuthStore } from '../context/store'
import { formatPrice, timeAgo, getCategoryMeta } from '../utils/constants'
import { PLACEHOLDER_IMAGES } from '../utils/constants'

const STATUS_LABELS = {
  active: { label: 'Activo', cls: 'bg-green-100 text-green-700' },
  sold: { label: 'Vendido', cls: 'bg-earth-100 text-earth-500' },
  paused: { label: 'Pausado', cls: 'bg-amber-100 text-amber-700' },
  expired: { label: 'Vencido', cls: 'bg-red-100 text-red-600' },
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuthStore()
  const [searchParams] = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshUser()
    api.get('/listings/my/listings')
      .then(r => setListings(r.data))
      .finally(() => setLoading(false))
  }, [])

  const deleteListing = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este anuncio?')) return
    await api.delete(`/listings/${id}`)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  const toggleStatus = async (listing) => {
    const newStatus = listing.status === 'active' ? 'paused' : 'active'
    const { data } = await api.put(`/listings/${listing.id}`, { status: newStatus })
    setListings(prev => prev.map(l => l.id === listing.id ? data : l))
  }

  const activeCount = listings.filter(l => l.status === 'active').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="section-title mb-1">Mi Panel</h1>
          <p className="text-earth-400 text-sm">Hola, {user?.full_name?.split(' ')[0]} 👋</p>
        </div>
        <Link to="/publish" className="btn-primary"><Plus size={16} /> Publicar</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Anuncios activos', value: activeCount, icon: <CheckCircle size={18} className="text-green-500" /> },
          { label: 'Total publicados', value: listings.length, icon: <Eye size={18} className="text-brand-500" /> },
          { label: 'Plan actual', value: user?.is_trial ? 'Trial' : user?.subscription_plan || 'free', icon: <AlertCircle size={18} className="text-amber-500" /> },
          { label: user?.is_trial ? 'Días restantes' : 'Límite', value: user?.is_trial ? user?.trial_days_remaining : (user?.max_listings === 9999 ? '∞' : user?.max_listings), icon: <Clock size={18} className="text-earth-400" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-earth-400">{label}</span></div>
            <p className="font-display text-2xl font-bold text-earth-900 capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Payment success banner */}
      {paymentSuccess && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 flex items-center gap-4 mb-6 animate-fade-in">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0 text-white text-2xl">✅</div>
          <div>
            <p className="font-bold text-green-800 text-lg">¡Pago exitoso! Plan activado</p>
            <p className="text-green-600 text-sm">Tu plan ya está activo. ¡Empieza a publicar ahora!</p>
          </div>
          <Link to="/publish" className="btn-primary shrink-0 ml-auto">Publicar anuncio</Link>
        </div>
      )}

      {/* Trial banner */}
      {user?.is_trial && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center justify-between mb-8">
          <div>
            <p className="font-semibold text-green-800">🎉 Trial activo — {user.trial_days_remaining} días restantes</p>
            <p className="text-sm text-green-600">Estás disfrutando tu prueba gratis en ambos portales. ¡Publica hasta 3 anuncios!</p>
          </div>
          <Link to="/pricing" className="btn-primary shrink-0 bg-green-600 hover:bg-green-700">Ver planes</Link>
        </div>
      )}

      {/* Subscription banner */}
      {!user?.has_active_subscription && !user?.is_trial && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between mb-8">
          <div>
            <p className="font-semibold text-amber-800">No tienes suscripción activa</p>
            <p className="text-sm text-amber-600">Activa un plan para publicar anuncios desde $19.900/mes</p>
          </div>
          <Link to="/pricing" className="btn-primary shrink-0">Ver planes</Link>
        </div>
      )}

      {/* Listings */}
      <div>
        <h2 className="font-semibold text-earth-800 mb-4">Mis anuncios ({listings.length})</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 flex gap-4 animate-pulse">
                <div className="skeleton w-20 h-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/4" /></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="card p-12 text-center text-earth-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-earth-600 mb-1">No tienes anuncios aún</p>
            <p className="text-sm mb-4">Publica tu primer anuncio y empieza a vender</p>
            <Link to="/publish" className="btn-primary inline-flex"><Plus size={16} /> Publicar ahora</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(listing => {
              const cat = getCategoryMeta(listing.category)
              const img = listing.thumbnail_url || listing.photos?.[0] || PLACEHOLDER_IMAGES[listing.category]?.[0] || PLACEHOLDER_IMAGES.default
              const st = STATUS_LABELS[listing.status] || STATUS_LABELS.active
              return (
                <div key={listing.id} className="card p-4 flex items-center gap-4">
                  <img src={img} alt={listing.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGES.default }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs">{cat.icon} {cat.label}</span>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </div>
                    <Link to={`/listings/${listing.id}`} className="font-semibold text-earth-900 text-sm line-clamp-1 hover:text-brand-600">{listing.title}</Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-earth-400">
                      <span className="font-semibold text-brand-600">{formatPrice(listing.price)}</span>
                      <span><Eye size={11} className="inline mr-0.5" />{listing.views_count}</span>
                      <span>{timeAgo(listing.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleStatus(listing)}
                      className="btn-ghost text-xs p-2" title={listing.status === 'active' ? 'Pausar' : 'Activar'}>
                      {listing.status === 'active' ? <Clock size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <Link to={`/publish/edit/${listing.id}`} className="btn-ghost p-2"><Edit2 size={16} /></Link>
                    <button onClick={() => deleteListing(listing.id)} className="btn-ghost p-2 hover:text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}