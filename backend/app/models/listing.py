from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ListingCategory(str, enum.Enum):
    VEHICULOS = "vehiculos"
    MAQUINARIA = "maquinaria"
    GANADO = "ganado"
    ELECTRODOMESTICOS = "electrodomesticos"
    EMPLEOS = "empleos"
    SERVICIOS = "servicios"
    REPUESTOS = "repuestos"

class ListingStatus(str, enum.Enum):
    ACTIVE = "active"
    SOLD = "sold"
    PAUSED = "paused"
    EXPIRED = "expired"

class ListingCondition(str, enum.Enum):
    NEW = "new"
    USED = "used"
    REFURBISHED = "refurbished"

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=True)  # Null = precio a convenir
    price_negotiable = Column(Boolean, default=False)
    category = Column(Enum(ListingCategory), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    condition = Column(Enum(ListingCondition), default=ListingCondition.USED)
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE)

    # Localización
    city = Column(String(100), default="Vélez")
    municipality = Column(String(100), nullable=True)
    department = Column(String(100), default="Santander")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Fotos (URLs de Cloudinary)
    photos = Column(JSON, default=[])  # Lista de URLs
    thumbnail_url = Column(String, nullable=True)

    # Atributos dinámicos por categoría (JSON flexible)
    attributes = Column(JSON, default={})
    # Ejemplo vehículos: {"marca": "Toyota", "modelo": "Hilux", "año": 2020, "kilometraje": 45000, "combustible": "diesel"}
    # Ejemplo ganado: {"especie": "bovino", "raza": "cebú", "cantidad": 10, "peso_aprox": 350}
    # Ejemplo empleo: {"tipo_contrato": "fijo", "salario": 1200000, "horario": "diurno"}

    # Destacado
    is_featured = Column(Boolean, default=False)
    featured_until = Column(DateTime, nullable=True)

    # Contacto
    contact_phone = Column(String(20), nullable=True)
    contact_whatsapp = Column(String(20), nullable=True)
    contact_email = Column(String(200), nullable=True)

    # Estadísticas
    views_count = Column(Integer, default=0)

    # Relaciones
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="listings")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime, nullable=True)
