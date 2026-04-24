import { useState, useEffect } from 'react'
import { Check, Zap, Star, Crown, Gift, Toggle } from 'lucide-react'
import { useAuthStore } from '../context/store'
import { useCrossDiscount } from '../hooks/useCrossDiscount'
import api from '../utils/api'

const ICONS = { basic: <Zap size={22} />, pro: <Star size={22} />, premium: <Crown size={22} /> }
const ICON_COLORS = {
  basic: 'text-earth-600 bg-earth-100',
  pro: 'text-brand-600 bg-brand-100',
  premium: 'text-amber-600 bg-amber-100'
}

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)

export default function PricingPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { discount, applyDiscount } = useCrossDiscount()
  const [loading, setLoading] = useState('')
  const [period, setPeriod] = useState('monthly') // 'monthly' | 'annual'
  const [plans, setPlans] = useState([])

  useEffect(() => {
    api.get('/subscriptions/plans')
      .then(r => setPlans(r.data))
      .catch(() => {})
  }, [])

  const handleSubscribe = async (planKey) => {
    if (!isAuthenticated()) { window.location.href = '/register'; return }
    setLoading(planKey)
    try {
      const { data } = await api.post('/subscriptions/create-payment-link', {
        plan: planKey,
        period
      })
      window.location.href = data.checkout_url
    } catch (e) {
      alert('Error al generar el enlace de pago. Intenta nuevamente.')
    } finally {
      setLoading('')
    }
  }

  const isCurrent = (planKey) =>
    user?.subscription_plan === planKey && user?.has_active_subscription && !user?.is_trial

  const getPrice = (plan) => {
    const base = period === 'annual' ? plan.annual_price : plan.monthly_price
    return applyDiscount ? applyDiscount(base) : base
  }

  const getOriginalPrice = (plan) =>
    period === 'annual' ? plan.annual_price : plan.monthly_price

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-earth-900 mb-3">Planes y precios</h1>
        <p className="text-earth-400 max-w-md mx-auto">
          Publica en VelezYRicaurte y llega a toda la región. Sin contratos, cancela cuando quieras.
        </p>
      </div>

      {/* Toggle mensual / anual */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={`text-sm font-semibold ${period === 'monthly' ? 'text-earth-900' : 'text-earth-400'}`}>
          Mensual
        </span>
        <button
          onClick={() => setPeriod(p => p === 'monthly' ? 'annual' : 'monthly')}
          className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
            period === 'annual' ? 'bg-brand-500' : 'bg-earth-300'
          }`}
        >
          <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            period === 'annual' ? 'translate-x-8' : 'translate-x-1'
          }`} />
        </button>
        <span className={`text-sm font-semibold ${period === 'annual' ? 'text-earth-900' : 'text-earth-400'}`}>
          Anual
        </span>
        {period === 'annual' && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
            2 meses gratis 🎉
          </span>
        )}
      </div>

      {/* Cross discount banner */}
      {discount?.eligible && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-center gap-4 mb-8 animate-fade-in">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <Gift size={24} className="text-amber-900" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-lg">{discount.discount_percent}% de descuento adicional</p>
            <p className="text-amber-700 text-sm">{discount.message}</p>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.plan}
            className={`card p-7 flex flex-col border-2 transition-all ${
              plan.plan === 'pro'
                ? 'border-brand-400 shadow-glow scale-[1.02]'
                : 'border-transparent hover:border-earth-200'
            }`}
          >
            {plan.plan === 'pro' && (
              <div className="mb-4">
                <span className="badge bg-brand-500 text-white">Más popular</span>
              </div>
            )}
            {plan.plan === 'premium' && (
              <div className="mb-4">
                <span className="badge bg-amber-400 text-amber-900">Todo incluido</span>
              </div>
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${ICON_COLORS[plan.plan]}`}>
              {ICONS[plan.plan]}
            </div>

            <h2 className="font-display text-xl font-bold text-earth-900 mb-1">{plan.label}</h2>

            {/* Precio */}
            <div className="mb-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-earth-900">
                  {formatPrice(getPrice(plan))}
                </span>
                <span className="text-earth-400 text-sm">
                  /{period === 'annual' ? 'año' : 'mes'}
                </span>
              </div>
              {discount?.eligible && (
                <span className="text-sm text-earth-400 line-through">{formatPrice(getOriginalPrice(plan))}</span>
              )}
              {period === 'annual' && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  Ahorras {formatPrice(plan.annual_savings)} al año
                </p>
              )}
              {period === 'monthly' && (
                <p className="text-xs text-earth-400 mt-1">
                  O {formatPrice(plan.annual_price)}/año (2 meses gratis)
                </p>
              )}
            </div>

            <ul className="space-y-2.5 mb-7 flex-1 mt-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-earth-600">
                  <Check size={15} className="text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {isCurrent(plan.plan) ? (
              <div className="text-center py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm border border-green-200">
                ✓ Plan actual
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(plan.plan)}
                disabled={loading === plan.plan}
                className={`${plan.plan === 'pro' ? 'btn-primary' : 'btn-secondary'} w-full justify-center py-3`}
              >
                {loading === plan.plan ? 'Redirigiendo a Wompi...' : 'Activar plan'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Trial info */}
      {user?.is_trial && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 flex items-center gap-4 mb-10">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center shrink-0 text-xl">🎁</div>
          <div>
            <p className="font-semibold text-brand-800">Estás en periodo de prueba — {user.trial_days_remaining} días restantes</p>
            <p className="text-brand-600 text-sm">Activa un plan para seguir publicando después del trial.</p>
          </div>
        </div>
      )}

      {/* Free tier */}
      <div className="card p-6 flex items-start gap-4 mb-12 border border-earth-100">
        <div className="w-10 h-10 bg-earth-100 rounded-xl flex items-center justify-center shrink-0 text-xl">🆓</div>
        <div>
          <h3 className="font-semibold text-earth-800 mb-1">¿Sin presupuesto aún?</h3>
          <p className="text-earth-500 text-sm">
            Regístrate gratis y prueba con <strong>3 anuncios durante 30 días</strong>. Cuando estés listo, activa tu plan.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="font-display text-2xl font-bold text-earth-900 text-center mb-8">Preguntas frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { q: '¿Cómo funciona el pago?', a: 'Pagamos con Wompi, la plataforma colombiana. Acepta tarjetas débito/crédito, PSE y Nequi.' },
            { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Tu suscripción no se renueva automáticamente. Permanece activa hasta el vencimiento.' },
            { q: '¿Qué pasa con mis anuncios si cancelo?', a: 'Permanecen visibles hasta que venza tu plan. Luego se desactivan automáticamente.' },
            { q: '¿Qué incluye el plan anual?', a: 'Exactamente lo mismo que el mensual pero con 2 meses gratis — pagas 10, usas 12.' },
            { q: '¿Puedo cambiar de plan?', a: 'Sí, activa un nuevo plan en cualquier momento. El tiempo restante del plan anterior se respeta.' },
            { q: '¿El descuento de .com aplica aquí?', a: 'Sí, si tienes un plan activo en velezyricaurte.com, recibes descuento proporcional aquí.' },
          ].map(({ q, a }) => (
            <div key={q} className="card p-5">
              <h3 className="font-semibold text-earth-800 mb-2 text-sm">{q}</h3>
              <p className="text-earth-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Wompi */}
      <div className="text-center mt-14">
        <p className="text-earth-400 text-sm mb-3">Pagos seguros procesados por</p>
        <div className="inline-flex items-center gap-3 bg-earth-50 border border-earth-200 rounded-xl px-6 py-3">
          <span className="font-bold text-earth-700 text-lg">Wompi</span>
          <span className="text-earth-300">·</span>
          <span className="text-xs text-earth-500">Plataforma de pagos Colombia</span>
        </div>
        <div className="mt-4">
          <a
            href="https://wa.me/573116861370?text=Hola,%20tengo%20dudas%20sobre%20los%20planes%20de%20VelezYRicaurte.info"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-700 hover:underline"
          >
            ¿Dudas? Escríbenos por WhatsApp →
          </a>
        </div>
      </div>
    </div>
  )
}