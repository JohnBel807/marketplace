from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, get_db
from app.routers import auth, listings, users, subscriptions, categories, cross_auth

app = FastAPI(
    title="VelezYRicaurte Marketplace API",
    description="Marketplace local para la región de Vélez y Ricaurte, Santander",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://velezyricaurte.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(users.router, prefix="/api/users", tags=["Usuarios"])
app.include_router(listings.router, prefix="/api/listings", tags=["Anuncios"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categorías"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Suscripciones"])
app.include_router(cross_auth.router, prefix="/api/cross-auth", tags=["Integración portales"])

@app.on_event("startup")
async def startup():
    import logging
    logger = logging.getLogger("uvicorn")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Base de datos inicializada correctamente")
    except Exception as e:
        logger.error(f"⚠️ No se pudo conectar a la BD al arrancar: {e}")

@app.get("/")
def root():
    return {"message": "VelezYRicaurte Marketplace API v1.0", "status": "online"}

@app.get("/health")
def health():
    # Healthcheck simple — responde aunque la BD no esté lista
    try:
        db = next(get_db())
        db.execute(__import__('sqlalchemy').text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "unavailable"
    return {"status": "healthy", "db": db_status}
