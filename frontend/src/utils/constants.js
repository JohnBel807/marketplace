export const CATEGORIES = [
  {
    key: 'vehiculos',
    label: 'Vehículos',
    icon: '🚗',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    subcategories: ['Carros', 'Motos', 'Camionetas / SUVs', 'Eléctricos', 'Vehículos de carga'],
    attributes: ['marca', 'modelo', 'año', 'kilometraje', 'combustible', 'color', 'transmisión'],
  },
  {
    key: 'maquinaria',
    label: 'Maquinaria Agrícola',
    icon: '🚜',
    color: 'bg-green-50 text-green-700 border-green-200',
    subcategories: ['Tractores', 'Cosechadoras', 'Fumigadoras', 'Motobombas', 'Otro'],
    attributes: ['marca', 'modelo', 'año', 'horas_uso', 'potencia_hp'],
  },
  {
    key: 'ganado',
    label: 'Ganado y Animales',
    icon: '🐄',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    subcategories: ['Bovinos', 'Porcinos', 'Equinos', 'Aves de corral', 'Otro'],
    attributes: ['especie', 'raza', 'cantidad', 'peso_aprox_kg', 'edad_meses'],
  },
  {
    key: 'electrodomesticos',
    label: 'Electro y Tecnología',
    icon: '📺',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    subcategories: ['Neveras', 'Lavadoras', 'TV y sonido', 'Celulares', 'Computadores', 'Otro'],
    attributes: ['marca', 'modelo', 'estado', 'garantia'],
  },
  {
    key: 'empleos',
    label: 'Empleos Locales',
    icon: '💼',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    subcategories: ['Agricultura', 'Construcción', 'Comercio', 'Transporte', 'Otro'],
    attributes: ['tipo_contrato', 'salario', 'horario', 'experiencia_requerida'],
  },
  {
    key: 'servicios',
    label: 'Servicios',
    icon: '🔧',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    subcategories: ['Mecánica', 'Construcción', 'Electricidad', 'Plomería', 'Transporte', 'Salud', 'Otro'],
    attributes: ['tipo_servicio', 'disponibilidad', 'cobertura_geografica'],
  },
  {
    key: 'repuestos',
    label: 'Repuestos',
    icon: '⚙️',
    color: 'bg-red-50 text-red-700 border-red-200',
    subcategories: ['Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Carrocería', 'Llantas', 'Otro'],
    attributes: ['marca_compatible', 'referencia', 'estado'],
  },
]

export const MUNICIPALITIES = [
  'Vélez', 'Ricaurte', 'Barbosa', 'Guavatá', 'Puente Nacional',
  'Bolívar', 'Sucre', 'Jesús María', 'Albania', 'Chipatá',
  'El Peñón', 'Güepsa', 'La Paz', 'Landázuri', 'San Benito', 'Otro'
]

export const SUBSCRIPTION_PLANS = [
  {
    key: 'basic',
    label: 'Plan Básico',
    price: 19900,
    maxListings: 5,
    color: 'border-earth-300',
    features: ['Hasta 5 anuncios activos', 'Fotos múltiples (hasta 8)', 'Contacto por WhatsApp', 'Vigencia 30 días'],
  },
  {
    key: 'pro',
    label: 'Plan Pro',
    price: 39900,
    maxListings: 20,
    color: 'border-brand-400',
    badge: 'Más popular',
    features: ['Hasta 20 anuncios activos', 'Fotos múltiples (hasta 8)', 'Estadísticas de vistas', 'Prioridad en búsqueda', 'Vigencia 30 días'],
  },
  {
    key: 'premium',
    label: 'Plan Premium',
    price: 69900,
    maxListings: 9999,
    color: 'border-amber-400',
    badge: 'Todo incluido',
    features: ['Anuncios ilimitados', 'Destacado en Home', 'Badge verificado', 'Soporte prioritario', 'Vigencia 30 días'],
  },
]

export const formatPrice = (price) => {
  if (!price) return 'Precio a convenir'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)
}

export const formatNumber = (n) =>
  new Intl.NumberFormat('es-CO').format(n)

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  return `hace ${mins} min`
}

// Random placeholder images by category
export const PLACEHOLDER_IMAGES = {
  vehiculos: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  ],
  maquinaria: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
  ],
  ganado: [
    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80',
    'https://images.unsplash.com/photo-1592754862816-1a21a4ea2281?w=600&q=80',
  ],
  electrodomesticos: [
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
  ],
  empleos: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
  ],
  servicios: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
  ],
  repuestos: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
  ],
  default: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80',
}

export const getCategoryMeta = (key) => CATEGORIES.find(c => c.key === key) || { label: key, icon: '📦', color: 'bg-earth-100 text-earth-600' }
