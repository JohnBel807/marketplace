from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import auth, listings, users, subscriptions, categories, cross_auth

Base.metadata.create_all(bind=engine)

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

@app.get("/")
def root():
    return {"message": "VelezYRicaurte Marketplace API v1.0", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy"}
