import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Plus, User, LogOut, ChevronDown, MapPin } from 'lucide-react'
import { useAuthStore } from '../../context/store'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-earth-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm">V</div>
            <div className="leading-tight">
              <p className="font-display font-bold text-earth-900 text-base leading-none">VelezYRicaurte</p>
              <p className="text-[10px] text-earth-400 flex items-center gap-0.5">
                <MapPin size={9} /> Marketplace Regional
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/listings" className="btn-ghost text-sm">Explorar</Link>
            <Link to="/pricing" className="btn-ghost text-sm">Planes</Link>
            {isAuthenticated() ? (
              <>
                <Link to="/publish" className="btn-primary text-sm">
                  <Plus size={16} /> Publicar
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 ml-2 px-3 py-2 rounded-xl hover:bg-earth-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        : <span className="text-brand-700 font-semibold text-sm">{user?.full_name?.[0]}</span>
                      }
                    </div>
                    <span className="text-sm font-medium text-earth-700 max-w-[100px] truncate">{user?.full_name}</span>
                    <ChevronDown size={14} className="text-earth-400" />
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-card-hover border border-earth-100 py-1 z-50 animate-fade-in">
                      <Link to="/dashboard" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-earth-700 hover:bg-earth-50">
                        <User size={15} /> Mi Panel
                      </Link>
                      <hr className="my-1 border-earth-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={15} /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="btn-secondary text-sm">Ingresar</Link>
                <Link to="/register" className="btn-primary text-sm">Registrarse</Link>
              </div>
            )}
          </nav>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden btn-ghost p-2">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-earth-100 bg-white px-4 pb-4 pt-2 space-y-1 animate-fade-in">
          <Link to="/listings" onClick={() => setOpen(false)} className="block py-2.5 text-earth-700 font-medium border-b border-earth-50">Explorar</Link>
          <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 text-earth-700 font-medium border-b border-earth-50">Planes</Link>
          {isAuthenticated() ? (
            <>
              <Link to="/publish" onClick={() => setOpen(false)} className="block py-2.5 text-brand-600 font-semibold border-b border-earth-50">+ Publicar anuncio</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2.5 text-earth-700 font-medium border-b border-earth-50">Mi Panel</Link>
              <button onClick={() => { handleLogout(); setOpen(false) }} className="w-full text-left py-2.5 text-red-600 font-medium">Cerrar sesión</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">Ingresar</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 justify-center">Registrarse</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
