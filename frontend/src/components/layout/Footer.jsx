import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-earth-900 text-earth-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">V</div>
              <span className="font-display font-bold text-white text-lg">VelezYRicaurte</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">El marketplace local de la provincia de Vélez, Santander. Compra, vende y conecta con tu comunidad.</p>
            <div className="flex items-center gap-1.5 text-sm">
              <MapPin size={14} className="text-brand-400" />
              <span>Vélez, Santander, Colombia</span>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Categorías</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['🚗', 'Vehículos', '/listings?category=vehiculos'],
                ['🚜', 'Maquinaria', '/listings?category=maquinaria'],
                ['🐄', 'Ganado', '/listings?category=ganado'],
                ['📺', 'Electrodomésticos', '/listings?category=electrodomesticos'],
                ['💼', 'Empleos', '/listings?category=empleos'],
                ['🔧', 'Servicios', '/listings?category=servicios'],
                ['⚙️', 'Repuestos', '/listings?category=repuestos'],
              ].map(([icon, label, href]) => (
                <li key={label}>
                  <Link to={href} className="hover:text-brand-400 transition-colors">{icon} {label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Información</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Planes y precios', '/pricing'],
                ['Términos de uso', '/terminos'],
                ['Política de privacidad', '/privacidad'],
                ['PQR', '/pqr'],
                ['Publicar anuncio', '/publish'],
              ].map(([label, href]) => (
                <li key={label}><Link to={href} className="hover:text-brand-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand-400 shrink-0" />
                <a href="mailto:info@velezyricaurte.com" className="hover:text-brand-400 transition-colors">info@velezyricaurte.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={14} className="text-green-400 shrink-0" />
                <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors">WhatsApp soporte</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-earth-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-earth-500">
          <p>© {year} VelezYRicaurte.com — Todos los derechos reservados</p>
          <p>NIT: 910.168.07-8 · Tecnoriente J.B.</p>
        </div>
      </div>
    </footer>
  )
}
