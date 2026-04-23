import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import api from '../utils/api'

// ── Forgot Password ───────────────────────────────────────────────
export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSent(true)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al enviar el correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-4">V</div>
          <h1 className="font-display text-3xl font-bold text-earth-900 mb-1">¿Olvidaste tu contraseña?</h1>
          <p className="text-earth-400 text-sm">Te enviaremos un enlace para restablecerla</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-earth-900 mb-2">¡Correo enviado!</h2>
              <p className="text-earth-500 text-sm mb-6">
                Si el correo está registrado, recibirás un enlace en los próximos minutos.
                Revisa también tu carpeta de spam.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                    <input
                      type="email"
                      className="input pl-10"
                      placeholder="tu@correo.com"
                      {...register('email', {
                        required: 'El correo es requerido',
                        pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                      })}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
              <p className="text-center text-sm text-earth-400 mt-6">
                <Link to="/login" className="text-brand-600 font-semibold hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Reset Password ────────────────────────────────────────────────
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-5xl mb-4">🔗</p>
          <h1 className="font-display text-2xl font-bold text-earth-900 mb-3">Enlace inválido</h1>
          <p className="text-earth-400 mb-6">Este enlace de recuperación no es válido o ha expirado.</p>
          <Link to="/forgot-password" className="btn-primary">Solicitar nuevo enlace</Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: data.password
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-4">V</div>
          <h1 className="font-display text-3xl font-bold text-earth-900 mb-1">Nueva contraseña</h1>
          <p className="text-earth-400 text-sm">Elige una contraseña segura para tu cuenta</p>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-earth-900 mb-2">¡Contraseña actualizada!</h2>
              <p className="text-earth-500 text-sm mb-2">Tu contraseña ha sido restablecida correctamente.</p>
              <p className="text-earth-400 text-xs">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                  {error.includes('expirado') && (
                    <div className="mt-2">
                      <Link to="/forgot-password" className="text-red-700 font-semibold underline">
                        Solicitar nuevo enlace
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Nueva contraseña</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="input pl-10 pr-10"
                      placeholder="Mínimo 8 caracteres"
                      {...register('password', {
                        required: 'La contraseña es requerida',
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                      })}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                      {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="label">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                    <input
                      type={showPwd2 ? 'text' : 'password'}
                      className="input pl-10 pr-10"
                      placeholder="Repite la contraseña"
                      {...register('confirm_password', {
                        required: 'Confirma tu contraseña',
                        validate: v => v === watch('password') || 'Las contraseñas no coinciden'
                      })}
                    />
                    <button type="button" onClick={() => setShowPwd2(!showPwd2)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                      {showPwd2 ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                  {loading ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
