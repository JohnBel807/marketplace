from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/velezyricaurte"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Wompi
    WOMPI_PUBLIC_KEY: str = ""
    WOMPI_PRIVATE_KEY: str = ""
    WOMPI_EVENTS_SECRET: str = ""

    # WhatsApp
    WHATSAPP_NUMBER: str = "573001234567"

    # Cross-portal integration
    CROSS_PORTAL_SECRET: str = "cambia-esto-secreto-compartido-entre-portales"
    COM_PORTAL_API_URL: str = "https://api.velezyricaurte.com/api"
    INFO_PORTAL_API_URL: str = "https://api.velezyricaurte.info/api"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"
        
settings = Settings()
