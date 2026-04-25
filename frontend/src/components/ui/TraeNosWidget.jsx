import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'

export default function TraeNosWidget() {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const url = 'https://traenos.velezyricaurte.com?utm_source=info&utm_medium=widget_flotante'

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2">
      {expanded && (
        <div
          className="bg-white rounded-2xl shadow-card-hover border border-earth-100 overflow-hidden animate-fade-up w-64"
          style={{borderTop: '3px solid #1e3a5f'}}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{background:'#1e3a5f'}}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛵</span>
              <span className="font-bold text-white text-sm">TraeNos</span>
            </div>
            <button onClick={() => setDismissed(true)} className="text-white/60 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-earth-700 text-xs leading-relaxed mb-3">
              <strong>Domicilios colaborativos</strong> para Vélez y Ricaurte. Ahorra hasta <strong className="text-blue-700">80%</strong> compartiendo envíos con vecinos de tu zona.
            </p>
            <div className="flex gap-2 text-xs text-earth-500 mb-3">
              <span className="bg-earth-100 px-2 py-1 rounded-full">1,200+ usuarios</span>
              <span className="bg-earth-100 px-2 py-1 rounded-full">45 zonas</span>
              <span className="bg-earth-100 px-2 py-1 rounded-full">2-4 hrs</span>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1 w-full text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
              style={{background:'#1e3a5f'}}
            >
              Pedir domicilio <ChevronRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-14 h-14 rounded-full shadow-card-hover flex items-center justify-center text-white font-bold text-xl transition-transform hover:scale-105"
        style={{background: expanded ? '#0f2744' : '#1e3a5f'}}
        aria-label="TraeNos — Domicilios colaborativos"
      >
        🛵
      </button>
    </div>
  )
}
