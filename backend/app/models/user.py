from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    BASIC = "basic"       # $19.900/mes — hasta 5 anuncios
    PRO = "pro"           # $39.900/mes — hasta 20 anuncios
    PREMIUM = "premium"   # $69.900/mes — ilimitado + destacados

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)
    city = Column(String(100), default="Vélez")
    department = Column(String(100), default="Santander")

    # Suscripción
    subscription_plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.FREE)
    subscription_status = Column(String(50), default="inactive")  # active, inactive, cancelled
    wompi_customer_id = Column(String, nullable=True)
    subscription_expires_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    listings = relationship("Listing", back_populates="owner", cascade="all, delete-orphan")

    @property
    def has_active_subscription(self) -> bool:
        from datetime import datetime
        if self.subscription_status == "active" and self.subscription_plan != SubscriptionPlan.FREE:
            if self.subscription_expires_at and self.subscription_expires_at > datetime.utcnow():
                return True
        return False

    @property
    def max_listings(self) -> int:
        limits = {
            SubscriptionPlan.FREE: 1,
            SubscriptionPlan.BASIC: 5,
            SubscriptionPlan.PRO: 20,
            SubscriptionPlan.PREMIUM: 9999
        }
        return limits.get(self.subscription_plan, 1)
