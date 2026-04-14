import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-8xl font-display font-bold text-earth-100 mb-2">404</p>
        <h1 className="font-display text-2xl font-bold text-earth-900 mb-3">Página no encontrada</h1>
        <p className="text-earth-400 text-sm mb-8">La página que buscas no existe o fue movida.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Ir al inicio</Link>
          <Link to="/listings" className="btn-secondary">Ver anuncios</Link>
        </div>
      </div>
    </div>
  )
}
