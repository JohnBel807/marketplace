from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum
from datetime import datetime, timedelta

class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    TRIAL = "trial"           # 30 días gratis al registrarse
    BASIC = "basic"           # $19.900/mes — hasta 5 anuncios
    PRO = "pro"               # $39.900/mes — hasta 20 anuncios
    PREMIUM = "premium"       # $69.900/mes — ilimitado + destacados

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
    subscription_plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.TRIAL)
    subscription_status = Column(String(50), default="active")
    wompi_customer_id = Column(String, nullable=True)
    subscription_expires_at = Column(DateTime, nullable=True)

    # Trial
    trial_started_at = Column(DateTime, nullable=True)
    trial_expires_at = Column(DateTime, nullable=True)
    trial_used = Column(Boolean, default=False)

    # Email
    email_verified = Column(Boolean, default=False)
    email_welcome_sent = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    listings = relationship("Listing", back_populates="owner", cascade="all, delete-orphan")

    @property
    def has_active_subscription(self) -> bool:
        now = datetime.utcnow()
        if self.subscription_plan == SubscriptionPlan.TRIAL:
            if self.trial_expires_at and self.trial_expires_at > now:
                return True
        if self.subscription_status == "active" and self.subscription_plan not in [SubscriptionPlan.FREE, SubscriptionPlan.TRIAL]:
            if self.subscription_expires_at and self.subscription_expires_at > now:
                return True
        return False

    @property
    def is_trial(self) -> bool:
        return self.subscription_plan == SubscriptionPlan.TRIAL and self.has_active_subscription

    @property
    def trial_days_remaining(self) -> int:
        if not self.trial_expires_at:
            return 0
        delta = self.trial_expires_at - datetime.utcnow()
        return max(0, delta.days)

    @property
    def max_listings(self) -> int:
        limits = {
            SubscriptionPlan.FREE: 0,
            SubscriptionPlan.TRIAL: 3,
            SubscriptionPlan.BASIC: 5,
            SubscriptionPlan.PRO: 20,
            SubscriptionPlan.PREMIUM: 9999
        }
        return limits.get(self.subscription_plan, 0)
