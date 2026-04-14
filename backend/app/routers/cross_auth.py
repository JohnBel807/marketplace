from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import httpx
from app.core.database import get_db
from app.core.security import get_current_active_user, hash_password, create_access_token
from app.core.config import settings
from app.models.user import User, SubscriptionPlan
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────
class CrossVerifyRequest(BaseModel):
    token: str  # JWT del otro portal

class CrossVerifyResponse(BaseModel):
    valid: bool
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    plan: Optional[str] = None
    has_active_subscription: bool = False
    discount_percent: int = 0
    portal: str = "velezyricaurte.info"

class CrossLoginRequest(BaseModel):
    email: EmailStr
    source_portal: str  # "com" o "info"
    cross_token: str    # token generado por el otro portal

class DiscountResponse(BaseModel):
    eligible: bool
    discount_percent: int
    source_plan: str
    message: str

# ── Tabla de descuentos proporcionales ────────────────────────────
DISCOUNT_TABLE = {
    SubscriptionPlan.FREE:    0,
    SubscriptionPlan.BASIC:   30,
    SubscriptionPlan.PRO:     50,
    SubscriptionPlan.PREMIUM: 70,
}

def get_discount_for_plan(plan: SubscriptionPlan) -> int:
    return DISCOUNT_TABLE.get(plan, 0)

# ── Endpoint: verificar token de .com en .info ────────────────────
@router.post("/cross-verify", response_model=CrossVerifyResponse)
async def cross_verify(
    payload: CrossVerifyRequest,
    x_portal_secret: str = Header(..., alias="X-Portal-Secret"),
    db: Session = Depends(get_db)
):
    """
    Recibe un JWT de velezyricaurte.com y verifica si el usuario
    existe en .info. Si existe, retorna su plan y descuento.
    Requiere el header X-Portal-Secret para autenticar portal a portal.
    """
    if x_portal_secret != settings.CROSS_PORTAL_SECRET:
        raise HTTPException(status_code=403, detail="Portal secret inválido")

    # Verificar el token con el otro portal
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{settings.COM_PORTAL_API_URL}/auth/me",
                headers={"Authorization": f"Bearer {payload.token}"}
            )
        if resp.status_code != 200:
            return CrossVerifyResponse(valid=False)

        com_user = resp.json()
    except Exception:
        return CrossVerifyResponse(valid=False)

    # Buscar si el usuario ya existe en .info por email
    local_user = db.query(User).filter(User.email == com_user["email"]).first()

    if not local_user:
        # Usuario de .com pero no registrado en .info
        return CrossVerifyResponse(
            valid=True,
            user_email=com_user["email"],
            user_name=com_user.get("full_name"),
            plan=com_user.get("subscription_plan", "free"),
            has_active_subscription=com_user.get("has_active_subscription", False),
            discount_percent=get_discount_for_plan(
                SubscriptionPlan(com_user.get("subscription_plan", "free"))
            ),
        )

    # Usuario existe en ambos portales
    discount = get_discount_for_plan(
        SubscriptionPlan(com_user.get("subscription_plan", "free"))
    ) if com_user.get("has_active_subscription") else 0

    return CrossVerifyResponse(
        valid=True,
        user_email=local_user.email,
        user_name=local_user.full_name,
        plan=com_user.get("subscription_plan", "free"),
        has_active_subscription=com_user.get("has_active_subscription", False),
        discount_percent=discount,
    )

# ── Endpoint: auto-registro desde .com → .info ───────────────────
@router.post("/cross-register")
async def cross_register(
    payload: CrossLoginRequest,
    x_portal_secret: str = Header(..., alias="X-Portal-Secret"),
    db: Session = Depends(get_db)
):
    """
    Cuando un usuario de .com accede a .info por primera vez,
    se crea automáticamente una cuenta vinculada.
    """
    if x_portal_secret != settings.CROSS_PORTAL_SECRET:
        raise HTTPException(status_code=403, detail="Portal secret inválido")

    # Verificar token con .com
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{settings.COM_PORTAL_API_URL}/auth/me",
                headers={"Authorization": f"Bearer {payload.cross_token}"}
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Token externo inválido")
        com_user = resp.json()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="No se pudo contactar el portal origen")

    # Verificar que el email coincide
    if com_user["email"] != payload.email:
        raise HTTPException(status_code=400, detail="Email no coincide con el token")

    # Si ya existe en .info, simplemente generar token local
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        token = create_access_token(data={"sub": str(existing.id)})
        discount = get_discount_for_plan(
            SubscriptionPlan(com_user.get("subscription_plan", "free"))
        ) if com_user.get("has_active_subscription") else 0
        return {
            "access_token": token,
            "token_type": "bearer",
            "cross_login": True,
            "discount_percent": discount,
            "message": f"Bienvenido de vuelta. Tienes {discount}% de descuento por tu plan en velezyricaurte.com"
        }

    # Crear cuenta espejo en .info
    new_user = User(
        full_name=com_user.get("full_name", ""),
        email=com_user["email"],
        phone=com_user.get("phone"),
        city=com_user.get("city", "Vélez"),
        hashed_password=hash_password(f"cross_{com_user['email']}_vyr"),  # contraseña temporal
        is_active=True,
        subscription_plan=SubscriptionPlan.FREE,
        subscription_status="inactive",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id)})
    discount = get_discount_for_plan(
        SubscriptionPlan(com_user.get("subscription_plan", "free"))
    ) if com_user.get("has_active_subscription") else 0

    return {
        "access_token": token,
        "token_type": "bearer",
        "cross_login": True,
        "new_account": True,
        "discount_percent": discount,
        "message": f"Cuenta creada automáticamente. Tienes {discount}% de descuento por tu plan en velezyricaurte.com"
    }

# ── Endpoint: consultar descuento aplicable ───────────────────────
@router.get("/discount", response_model=DiscountResponse)
async def get_cross_discount(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Consulta si el usuario tiene descuento disponible en este portal
    por tener un plan activo en el otro.
    """
    # Verificar con .com si el usuario tiene plan allá
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                f"{settings.COM_PORTAL_API_URL}/cross-auth/cross-verify",
                json={"email": current_user.email},
                headers={"X-Portal-Secret": settings.CROSS_PORTAL_SECRET}
            )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("has_active_subscription"):
                plan = data.get("plan", "free")
                discount = get_discount_for_plan(SubscriptionPlan(plan))
                return DiscountResponse(
                    eligible=discount > 0,
                    discount_percent=discount,
                    source_plan=plan,
                    message=f"Tienes {discount}% de descuento por tu plan {plan} en velezyricaurte.com"
                )
    except Exception:
        pass

    return DiscountResponse(
        eligible=False,
        discount_percent=0,
        source_plan="none",
        message="No tienes plan activo en velezyricaurte.com"
    )

# ── Endpoint: que .com use para verificar usuarios de .info ───────
@router.post("/verify-for-com")
async def verify_for_com(
    payload: dict,
    x_portal_secret: str = Header(..., alias="X-Portal-Secret"),
    db: Session = Depends(get_db)
):
    """Endpoint espejo: .com llama aquí para verificar usuarios de .info"""
    if x_portal_secret != settings.CROSS_PORTAL_SECRET:
        raise HTTPException(status_code=403, detail="Portal secret inválido")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email requerido")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"found": False, "has_active_subscription": False, "plan": "free", "discount_percent": 0}

    discount = get_discount_for_plan(user.subscription_plan) if user.has_active_subscription else 0

    return {
        "found": True,
        "has_active_subscription": user.has_active_subscription,
        "plan": user.subscription_plan.value,
        "discount_percent": discount,
        "message": f"Plan {user.subscription_plan.value} activo en velezyricaurte.info"
    }
