# VelezYRicaurte.com — Marketplace Regional

Marketplace local para la provincia de Vélez, Santander. Vehículos, maquinaria agrícola, ganado, electrodomésticos, empleos, servicios y repuestos.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI + SQLAlchemy + PostgreSQL |
| Frontend | React 18 + Vite + Tailwind CSS |
| Auth | JWT (OAuth2 Password Flow) |
| Imágenes | Cloudinary |
| Pagos | Wompi (Colombia) |
| Deploy | Railway (backend) + Vercel/Netlify (frontend) |

---

## Estructura del proyecto

```
velezyricaurte/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── Procfile
│   └── app/
│       ├── core/         # config, database, security
│       ├── models/       # User, Listing (SQLAlchemy)
│       ├── routers/      # auth, listings, categories, subscriptions, users
│       ├── schemas/      # Pydantic schemas
│       └── utils/        # cloudinary upload
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, ListingCard, etc.
│   │   ├── pages/        # HomePage, ListingsPage, Dashboard, etc.
│   │   ├── context/      # Zustand store (auth + listings)
│   │   └── utils/        # api.js, constants.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## Instalación local

### Prerrequisitos
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

### 1. Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE velezyricaurte;"

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

La API queda disponible en `http://localhost:8000`
Documentación interactiva: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend queda en `http://localhost:5173`

### 3. Con Docker (recomendado)

```bash
# En la raíz del proyecto
cp backend/.env.example backend/.env
# Editar backend/.env

docker-compose up --build
```

---

## Variables de entorno (backend)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de PostgreSQL |
| `SECRET_KEY` | Clave secreta para JWT (generar con `openssl rand -hex 32`) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `WOMPI_PUBLIC_KEY` | Llave pública de Wompi |
| `WOMPI_PRIVATE_KEY` | Llave privada de Wompi |
| `WOMPI_EVENTS_SECRET` | Secret para verificar webhooks de Wompi |
| `WHATSAPP_NUMBER` | Número de WhatsApp de soporte (ej: 573001234567) |

---

## Categorías del marketplace

| Categoría | Subcategorías ejemplo |
|-----------|----------------------|
| 🚗 Vehículos | Carros, Motos, Camionetas, Eléctricos, Carga |
| 🚜 Maquinaria Agrícola | Tractores, Cosechadoras, Fumigadoras |
| 🐄 Ganado y Animales | Bovinos, Porcinos, Equinos, Aves |
| 📺 Electrodomésticos | Neveras, TV, Celulares, Computadores |
| 💼 Empleos Locales | Agricultura, Construcción, Comercio |
| 🔧 Servicios | Mecánica, Construcción, Electricidad |
| ⚙️ Repuestos | Motor, Frenos, Suspensión, Llantas |

---

## Planes de suscripción

| Plan | Precio | Anuncios |
|------|--------|----------|
| Básico | $19.900/mes | 5 |
| Pro | $39.900/mes | 20 |
| Premium | $69.900/mes | Ilimitados + Destacados |

---

## Endpoints principales (API)

```
POST   /api/auth/register          Registro de usuario
POST   /api/auth/login             Login (JWT)
GET    /api/auth/me                Perfil actual

GET    /api/listings               Listado con filtros y paginación
POST   /api/listings               Crear anuncio (requiere suscripción)
GET    /api/listings/{id}          Detalle de anuncio
PUT    /api/listings/{id}          Editar anuncio (solo dueño)
DELETE /api/listings/{id}          Eliminar anuncio
GET    /api/listings/my/listings   Mis anuncios

GET    /api/categories             Todas las categorías con atributos
GET    /api/subscriptions/plans    Planes disponibles
POST   /api/subscriptions/create-payment-link  Pago Wompi
POST   /api/subscriptions/wompi-webhook        Webhook de Wompi
```

---

## Deploy en Railway (backend)

1. Crear proyecto en [Railway.app](https://railway.app)
2. Conectar repositorio GitHub
3. Agregar servicio PostgreSQL
4. Configurar variables de entorno
5. El `Procfile` ya está listo: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Deploy frontend en Vercel

```bash
cd frontend
npm run build
# Subir carpeta dist/ a Vercel o conectar el repo
```

Configurar en Vercel: `VITE_API_URL=https://tu-backend.railway.app/api`

---

## Configuración de Wompi

1. Crear cuenta en [Wompi](https://wompi.co)
2. Obtener llaves en el panel de Wompi
3. Configurar webhook apuntando a: `https://tu-dominio.com/api/subscriptions/wompi-webhook`
4. Evento a escuchar: `transaction.updated`

---

## Información legal

- **Empresa:** Tecnoriente J.B.
- **NIT:** 910.168.07-8
- **Correo:** info@velezyricaurte.com
- **Ubicación:** Vélez, Santander, Colombia
- **Ley de datos:** Cumple con Ley 1581 de 2012 (Habeas Data)
