import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Gift, X, ExternalLink } from 'lucide-react'
import api from '../../utils/api'
import { useAuthStore } from '../../context/store'

/**
 * Se muestra cuando el usuario llega desde velezyricaurte.com
 * con un token en la URL: /cross-login?token=xxx&email=yyy
 */
export default function CrossLoginBanner() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')
  const [discount, setDiscount] = useState(0)
  const [visible, setVisible] = useState(true)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const crossToken = searchParams.get('cross_token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!crossToken || !email) return
    setStatus('loading')
    api.post('/cross-auth/cross-register', {
      email,
      source_portal: 'com',
      cross_token: crossToken,
    }, {
      headers: { 'X-Portal-Secret': import.meta.env.VITE_CROSS_PORTAL_SECRET || '' }
    })
      .then(r => {
        localStorage.setItem('token', r.data.access_token)
        setDiscount(r.data.discount_percent || 0)
        setMessage(r.data.message)
        setStatus('success')
        // Limpiar params de la URL
        navigate('/listings', { replace: true })
      })
      .catch(() => {
        setStatus('error')
        setMessage('No se pudo verificar tu cuenta de velezyricaurte.com')
      })
  }, [crossToken, email])

  if (!crossToken || !visible) return null

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 card border-2 p-5 shadow-card-hover animate-fade-up ${
      status === 'success' ? 'border-green-300' : 'border-brand-300'
    }`}>
      <button onClick={() => setVisible(false)} className="absolute top-3 right-3 text-earth-400 hover:text-earth-700">
        <X size={16} />
      </button>

      {status === 'loading' && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-earth-600">Verificando tu cuenta de velezyricaurte.com...</p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gift size={20} className="text-brand-500" />
            <p className="font-semibold text-earth-900">¡Bienvenido desde velezyricaurte.com!</p>
          </div>
          <p className="text-sm text-earth-600 mb-3">{message}</p>
          {discount > 0 && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-display font-bold text-brand-600">{discount}% OFF</p>
              <p className="text-xs text-brand-500">en tu primer plan de VelezYRicaurte.info</p>
            </div>
          )}
          <button onClick={() => navigate('/pricing')} className="btn-primary w-full justify-center mt-3">
            Ver planes con descuento
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <X size={16} />
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}
