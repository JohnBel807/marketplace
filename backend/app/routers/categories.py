from fastapi import APIRouter
from app.models.listing import ListingCategory

router = APIRouter()

CATEGORY_META = {
    ListingCategory.VEHICULOS: {
        "label": "Vehículos",
        "icon": "🚗",
        "subcategories": ["Carros", "Motos", "Camionetas / SUVs", "Eléctricos", "Vehículos de carga"],
        "attributes": ["marca", "modelo", "año", "kilometraje", "combustible", "color", "transmisión", "placa"]
    },
    ListingCategory.MAQUINARIA: {
        "label": "Maquinaria Agrícola",
        "icon": "🚜",
        "subcategories": ["Tractores", "Cosechadoras", "Fumigadoras", "Motobombas", "Otro"],
        "attributes": ["marca", "modelo", "año", "horas_uso", "potencia_hp", "estado"]
    },
    ListingCategory.GANADO: {
        "label": "Ganado y Animales",
        "icon": "🐄",
        "subcategories": ["Bovinos", "Porcinos", "Equinos", "Aves de corral", "Otro"],
        "attributes": ["especie", "raza", "cantidad", "peso_aprox_kg", "edad_meses", "vacunado"]
    },
    ListingCategory.ELECTRODOMESTICOS: {
        "label": "Electrodomésticos y Tecnología",
        "icon": "📺",
        "subcategories": ["Neveras", "Lavadoras", "TV y sonido", "Celulares", "Computadores", "Otro"],
        "attributes": ["marca", "modelo", "estado", "garantia"]
    },
    ListingCategory.EMPLEOS: {
        "label": "Empleos Locales",
        "icon": "💼",
        "subcategories": ["Agricultura", "Construcción", "Comercio", "Servicios", "Transporte", "Otro"],
        "attributes": ["tipo_contrato", "salario", "horario", "experiencia_requerida", "prestaciones"]
    },
    ListingCategory.SERVICIOS: {
        "label": "Servicios",
        "icon": "🔧",
        "subcategories": ["Mecánica", "Construcción", "Electricidad", "Plomería", "Transporte", "Salud", "Otro"],
        "attributes": ["tipo_servicio", "disponibilidad", "cobertura_geografica"]
    },
    ListingCategory.REPUESTOS: {
        "label": "Repuestos Vehículos / Motos",
        "icon": "⚙️",
        "subcategories": ["Motor", "Frenos", "Suspensión", "Eléctrico", "Carrocería", "Llantas", "Otro"],
        "attributes": ["marca_compatible", "referencia", "estado", "garantia"]
    }
}

@router.get("/")
def get_categories():
    return [
        {"key": key.value, **meta}
        for key, meta in CATEGORY_META.items()
    ]

@router.get("/{category_key}")
def get_category(category_key: str):
    for key, meta in CATEGORY_META.items():
        if key.value == category_key:
            return {"key": key.value, **meta}
    return {"error": "Categoría no encontrada"}
