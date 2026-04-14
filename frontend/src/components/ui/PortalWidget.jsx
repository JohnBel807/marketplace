import { useState } from 'react'
import { ExternalLink, Home, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Barra lateral fija que enlaza a velezyricaurte.com
 * Se colapsa/expande con un botón
 */
export default function PortalWidget() {
  const [expanded, setExpanded] = useState(false)

  const comUrl = 'https://www.velezyricaurte.com'

  return (
    <div
      className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-stretch transition-all duration-300 ${
        expanded ? 'translate-x-0' : '-translate-x-[152px]'
      }`}
    >
      {/* Panel */}
      <div className="w-40 bg-white border border-earth-200 rounded-r-0 shadow-card-hover overflow-hidden">
        <div className="bg-teal-600 px-3 py-2">
          <p className="text-white text-xs font-semibold leading-tight">Portal Inmobiliario</p>
          <p className="text-teal-200 text-[10px]">velezyricaurte.com</p>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-[11px] text-earth-500 leading-tight">
            Casas, lotes y fincas en la región de Vélez
          </p>
          <a
            href={comUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition-colors w-full"
          >
            <Home size={13} />
            Ir al portal
            <ExternalLink size={11} className="ml-auto" />
          </a>
          <a
            href={`${comUrl}/listings`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-earth-500 hover:text-earth-700 px-1 transition-colors"
          >
            Ver propiedades →
          </a>
        </div>
        {/* Descuento cruzado */}
        <div className="mx-3 mb-3 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[10px] text-amber-700 font-semibold">¿Tienes plan aquí?</p>
          <p className="text-[10px] text-amber-600">Obtén descuento en .com</p>
        </div>
      </div>

      {/* Toggle tab */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex flex-col items-center justify-center w-6 bg-teal-600 hover:bg-teal-700 text-white rounded-r-lg transition-colors shadow-md"
        aria-label={expanded ? 'Ocultar portal' : 'Ver portal inmobiliario'}
      >
        {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        <span
          className="text-[9px] font-semibold mt-1 leading-none"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          .com
        </span>
      </button>
    </div>
  )
}
