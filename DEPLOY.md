# Guía de Deploy — VelezYRicaurte.info

## Resumen de servicios

| Componente | Plataforma | URL |
|---|---|---|
| Backend API | Railway | https://api.velezyricaurte.info |
| Frontend | Vercel | https://www.velezyricaurte.info |
| Base de datos | Railway PostgreSQL | (interna) |
| Imágenes | Cloudinary | (CDN) |
| Pagos | Wompi | (webhook) |

---

## Paso 1 — Backend en Railway

### 1.1 Crear proyecto
1. Ve a [railway.app](https://railway.app) → New Project
2. Deploy from GitHub repo → selecciona `velezyricaurte_marketplace`
3. Selecciona la carpeta `/backend` como root

### 1.2 Agregar PostgreSQL
1. En el proyecto Railway → Add Service → PostgreSQL
2. Railway genera automáticamente `DATABASE_URL`

### 1.3 Variables de entorno en Railway
```
SECRET_KEY=<openssl rand -hex 32>
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
WOMPI_PUBLIC_KEY=pub_prod_xxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxx
WOMPI_EVENTS_SECRET=tu_events_secret
CROSS_PORTAL_SECRET=<mismo valor en .com y .info>
COM_PORTAL_API_URL=https://api.velezyricaurte.com/api
WHATSAPP_NUMBER=573001234567
```

### 1.4 Dominio personalizado
1. Railway → Settings → Custom Domain
2. Agregar: `api.velezyricaurte.info`
3. En tu proveedor de dominio (GoDaddy/Namecheap):
   - CNAME `api` → `<tu-proyecto>.railway.app`

---

## Paso 2 — Frontend en Vercel

### 2.1 Importar proyecto
1. Ve a [vercel.com](https://vercel.com) → New Project
2. Importar desde GitHub → carpeta `/frontend`
3. Framework: Vite

### 2.2 Variables de entorno en Vercel
```
VITE_API_URL=https://api.velezyricaurte.info/api
VITE_CROSS_PORTAL_SECRET=<mismo CROSS_PORTAL_SECRET>
```

### 2.3 Dominio personalizado
1. Vercel → Settings → Domains
2. Agregar: `www.velezyricaurte.info`
3. En tu proveedor de dominio:
   - CNAME `www` → `cname.vercel-dns.com`
   - O A record `@` → `76.76.21.21`

---

## Paso 3 — Integración entre portales (.com ↔ .info)

### 3.1 Configurar el mismo CROSS_PORTAL_SECRET en AMBOS backends
Genera un secreto fuerte:
```bash
openssl rand -hex 32
```
Coloca el mismo valor en:
- `.env` de `velezyricaurte.com` backend
- `.env` de `velezyricaurte.info` backend (Railway)

### 3.2 Agregar el router cross_auth al backend de .com
Copia el archivo `backend/app/routers/cross_auth.py` al proyecto de `.com`
y registra el router en su `main.py`:
```python
from app.routers import cross_auth
app.include_router(cross_auth.router, prefix="/api/cross-auth", tags=["Integración portales"])
```

### 3.3 Agregar las variables al backend de .com
```
CROSS_PORTAL_SECRET=<mismo valor>
INFO_PORTAL_API_URL=https://api.velezyricaurte.info/api
```

### 3.4 Widget lateral en velezyricaurte.com
Agrega el componente `PortalWidget` al layout de `.com`, apuntando a `.info`:
```jsx
// Cambiar en PortalWidget.jsx la URL destino a:
const infoUrl = 'https://www.velezyricaurte.info'
```

---

## Paso 4 — Wompi webhooks (producción)

1. Panel Wompi → Desarrolladores → Webhooks
2. URL: `https://api.velezyricaurte.info/api/subscriptions/wompi-webhook`
3. Evento: `transaction.updated`
4. Copiar el Events Secret → variable `WOMPI_EVENTS_SECRET`

---

## Paso 5 — CI/CD automático (opcional)

### Secrets en GitHub Actions
Ve a tu repo → Settings → Secrets:
```
RAILWAY_TOKEN        # railway.app → Account → Tokens
VERCEL_TOKEN         # vercel.com → Settings → Tokens
VERCEL_ORG_ID        # vercel.com → Settings → General
VERCEL_PROJECT_ID    # vercel.com → Project → Settings
VITE_API_URL         # https://api.velezyricaurte.info/api
VITE_CROSS_PORTAL_SECRET
```

Con esto cada `git push` a `main` despliega automáticamente.

---

## Verificación post-deploy

```bash
# 1. API responde
curl https://api.velezyricaurte.info/health

# 2. Docs disponibles
open https://api.velezyricaurte.info/docs

# 3. Cross-auth funciona (reemplaza TOKEN con un JWT de .com)
curl -X POST https://api.velezyricaurte.info/api/cross-auth/cross-verify \
  -H "Content-Type: application/json" \
  -H "X-Portal-Secret: TU_CROSS_PORTAL_SECRET" \
  -d '{"token": "TOKEN_DE_VELEZYRICAURTE_COM"}'

# 4. Frontend carga
open https://www.velezyricaurte.info
```

---

## Descuentos cruzados — resumen

| Plan activo en... | Descuento en el otro portal |
|---|---|
| Básico ($19.900) | 30% OFF |
| Pro ($39.900) | 50% OFF |
| Premium ($69.900) | 70% OFF |

El descuento se aplica automáticamente en `/pricing` cuando el usuario está autenticado en ambos portales.
