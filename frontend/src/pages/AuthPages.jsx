import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, MapPin } from 'lucide-react'
import { useAuthStore } from '../context/store'

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const onSubmit = async (data) => {
    try {
      setError('')
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-4">V</div>
          <h1 className="font-display text-3xl font-bold text-earth-900 mb-1">Bienvenido</h1>
          <p className="text-earth-400 text-sm flex items-center justify-center gap-1">
            <MapPin size={13} /> VelezYRicaurte Marketplace
          </p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input type="email" className="input" placeholder="tu@correo.com"
                {...register('email', { required: 'Requerido', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  {...register('password', { required: 'Requerido' })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 mt-2">
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          <p className="text-center text-sm text-earth-400 mt-6">
            ¿No tienes cuenta? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const onSubmit = async (data) => {
    try {
      setError('')
      await registerUser({ full_name: data.full_name, email: data.email, phone: data.phone, password: data.password })
      navigate('/login?registered=1')
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-4">V</div>
          <h1 className="font-display text-3xl font-bold text-earth-900 mb-1">Crea tu cuenta</h1>
          <p className="text-earth-400 text-sm">Gratis. Sin compromisos.</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input type="text" className="input" placeholder="Juan Pérez"
                {...register('full_name', { required: 'Requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })} />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input type="email" className="input" placeholder="tu@correo.com"
                {...register('email', { required: 'Requerido', pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' } })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Teléfono / WhatsApp <span className="text-earth-400">(opcional)</span></label>
              <input type="tel" className="input" placeholder="3001234567"
                {...register('phone')} />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="Mínimo 8 caracteres"
                  {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <p className="text-xs text-earth-400">
              Al registrarte aceptas nuestros{' '}
              <a href="/terminos" className="text-brand-600 hover:underline">Términos de uso</a>{' '}
              y{' '}
              <a href="/privacidad" className="text-brand-600 hover:underline">Política de privacidad</a>.
            </p>
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
          <p className="text-center text-sm text-earth-400 mt-6">
            ¿Ya tienes cuenta? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
