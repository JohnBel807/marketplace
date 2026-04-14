import { useState } from 'react'
import { Check, Zap, Star, Crown, Gift } from 'lucide-react'
import { useAuthStore } from '../context/store'
import { SUBSCRIPTION_PLANS, formatPrice } from '../utils/constants'
import { useCrossDiscount } from '../hooks/useCrossDiscount'
import api from '../utils/api'

const ICONS = { basic: <Zap size={22} />, pro: <Star size={22} />, premium: <Crown size={22} /> }
const ICON_COLORS = { basic: 'text-earth-600 bg-earth-100', pro: 'text-brand-600 bg-brand-100', premium: 'text-amber-600 bg-amber-100' }

export default function PricingPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { discount, applyDiscount } = useCrossDiscount()
  const [loading, setLoading] = useState('')

  const handleSubscribe = async (planKey) => {
    if (!isAuthenticated()) { window.location.href = '/register'; return }
    setLoading(planKey)
    try {
      const { data } = await api.post('/subscriptions/create-payment-link', { plan: planKey })
      window.location.href = data.checkout_url
    } catch (e) {
      alert('Error al generar el enlace de pago. Intenta nuevamente.')
    } finally {
      setLoading('')
    }
  }

  const isCurrent = (planKey) => user?.subscription_plan === planKey && user?.has_active_subscription

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-earth-900 mb-3">Planes y precios</h1>
        <p className="text-earth-400 max-w-md mx-auto">Publica tus anuncios en VelezYRicaurte y llega a toda la región. Sin contratos, cancela cuando quieras.</p>
      </div>

      {/* Cross-portal discount banner */}
      {discount?.eligible && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-center gap-4 mb-8 animate-fade-in">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <Gift size={24} className="text-amber-900" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-lg">{discount.discount_percent}% de descuento aplicado</p>
            <p className="text-amber-700 text-sm">{discount.message}</p>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`card p-7 flex flex-col border-2 transition-all ${
              plan.key === 'pro'
                ? 'border-brand-400 shadow-glow scale-[1.02]'
                : 'border-transparent hover:border-earth-200'
            }`}
          >
            {plan.badge && (
              <div className="mb-4">
                <span className={`badge ${plan.key === 'pro' ? 'bg-brand-500 text-white' : 'bg-amber-400 text-amber-900'}`}>
                  {plan.badge}
                </span>
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${ICON_COLORS[plan.key]}`}>
              {ICONS[plan.key]}
            </div>
            <h2 className="font-display text-xl font-bold text-earth-900 mb-1">{plan.label}</h2>
            <div className="mb-5">
              <span className="font-display text-3xl font-bold text-earth-900">
                {formatPrice(applyDiscount(plan.price))}
              </span>
              <span className="text-earth-400 text-sm">/mes</span>
              {discount?.eligible && (
                <span className="ml-2 text-sm text-earth-400 line-through">{formatPrice(plan.price)}</span>
              )}
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-earth-600">
                  <Check size={15} className="text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {isCurrent(plan.key) ? (
              <div className="text-center py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm border border-green-200">
                ✓ Plan actual
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading === plan.key}
                className={`${plan.key === 'pro' ? 'btn-primary' : 'btn-secondary'} w-full justify-center py-3`}
              >
                {loading === plan.key ? 'Redirigiendo...' : 'Activar plan'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Free tier note */}
      <div className="card p-6 flex items-start gap-4 mb-12 border border-earth-100">
        <div className="w-10 h-10 bg-earth-100 rounded-xl flex items-center justify-center shrink-0 text-xl">🆓</div>
        <div>
          <h3 className="font-semibold text-earth-800 mb-1">¿Sin presupuesto aún?</h3>
          <p className="text-earth-500 text-sm">Regístrate gratis y publica <strong>1 anuncio de prueba</strong> sin costo. Cuando estés listo, activa tu plan.</p>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="section-title text-center mb-8">Preguntas frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { q: '¿Cómo funciona el pago?', a: 'Pagamos con Wompi, la plataforma de pagos colombiana. Acepta tarjetas débito/crédito, PSE y Nequi.' },
            { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Tu suscripción permanece activa hasta el final del mes pagado y no se renueva automáticamente.' },
            { q: '¿Qué pasa con mis anuncios si cancelo?', a: 'Los anuncios activos permanecen visibles hasta que venza tu plan. Luego se desactivan automáticamente.' },
            { q: '¿Cuántas fotos puedo subir por anuncio?', a: 'Hasta 8 fotos por anuncio en todos los planes. Las fotos se almacenan en Cloudinary de forma segura.' },
            { q: '¿Qué es un anuncio destacado?', a: 'Los anuncios destacados aparecen primero en los resultados y en el home page. Disponible en Plan Premium.' },
            { q: '¿Puedo cambiar de plan?', a: 'Sí, puedes actualizar tu plan en cualquier momento. El nuevo plan entra en vigencia de inmediato.' },
          ].map(({ q, a }) => (
            <div key={q} className="card p-5">
              <h3 className="font-semibold text-earth-800 mb-2 text-sm">{q}</h3>
              <p className="text-earth-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div className="text-center mt-14">
        <p className="text-earth-400 text-sm mb-3">¿Tienes dudas? Escríbenos por WhatsApp</p>
        <a
          href="https://wa.me/573116861370?text=Hola,%20tengo%20dudas%20sobre%20los%20planes%20de%20VelezYRicaurte.info"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contactar soporte
        </a>
      </div>
    </div>
  )
}
