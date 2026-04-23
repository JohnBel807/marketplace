from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime, timedelta
import secrets

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(128), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

    @classmethod
    def generate(cls, user_id: int, expires_minutes: int = 30):
        return cls(
            user_id=user_id,
            token=secrets.token_urlsafe(64),
            expires_at=datetime.utcnow() + timedelta(minutes=expires_minutes),
        )

    @property
    def is_valid(self) -> bool:
        return not self.used and self.expires_at > datetime.utcnow()
