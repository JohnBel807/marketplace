from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib, hmac, json
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.core.config import settings
from app.models.user import User, SubscriptionPlan
from app.schemas import SubscriptionCreate

router = APIRouter()

PLAN_PRICES = {
    SubscriptionPlan.BASIC: {"price": 19900, "days": 30, "label": "Plan Básico"},
    SubscriptionPlan.PRO: {"price": 39900, "days": 30, "label": "Plan Pro"},
    SubscriptionPlan.PREMIUM: {"price": 69900, "days": 30, "label": "Plan Premium"},
}

@router.get("/plans")
def get_plans():
    return [
        {
            "plan": plan.value,
            "price": info["price"],
            "label": info["label"],
            "max_listings": {"basic": 5, "pro": 20, "premium": 9999}[plan.value],
            "features": _plan_features(plan)
        }
        for plan, info in PLAN_PRICES.items()
    ]

def _plan_features(plan: SubscriptionPlan):
    base = ["Publicar anuncios", "Fotos múltiples", "Contacto directo por WhatsApp"]
    if plan == SubscriptionPlan.PRO:
        base += ["Hasta 20 anuncios", "Estadísticas de vistas"]
    if plan == SubscriptionPlan.PREMIUM:
        base += ["Anuncios ilimitados", "Destacado en home", "Soporte prioritario", "Badge verificado"]
    return base

@router.post("/create-payment-link")
def create_payment_link(
    data: SubscriptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plan_info = PLAN_PRICES.get(data.plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Plan inválido")

    # Wompi Checkout Link (el frontend abre este URL)
    wompi_checkout = {
        "public_key": settings.WOMPI_PUBLIC_KEY,
        "currency": "COP",
        "amount_in_cents": plan_info["price"] * 100,
        "reference": f"sub_{current_user.id}_{data.plan.value}_{int(datetime.utcnow().timestamp())}",
        "redirect_url": "https://velezyricaurte.com/dashboard?payment=success",
        "customer_data": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone_number": current_user.phone or ""
        }
    }
    return {
        "checkout_url": f"https://checkout.wompi.co/p/?public-key={settings.WOMPI_PUBLIC_KEY}&currency=COP&amount-in-cents={plan_info['price'] * 100}&reference={wompi_checkout['reference']}&redirect-url={wompi_checkout['redirect_url']}",
        "plan": data.plan.value,
        "amount": plan_info["price"],
        "reference": wompi_checkout["reference"]
    }

@router.post("/wompi-webhook")
async def wompi_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    payload = json.loads(body)

    # Verificar firma Wompi
    checksum = request.headers.get("x-event-checksum", "")
    event_data = payload.get("data", {})
    transaction = event_data.get("transaction", {})

    if payload.get("event") == "transaction.updated" and transaction.get("status") == "APPROVED":
        reference = transaction.get("reference", "")
        # Formato: sub_{user_id}_{plan}_{timestamp}
        parts = reference.split("_")
        if len(parts) >= 3 and parts[0] == "sub":
            user_id = int(parts[1])
            plan_key = parts[2]
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                try:
                    user.subscription_plan = SubscriptionPlan(plan_key)
                    user.subscription_status = "active"
                    user.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
                    db.commit()
                except Exception:
                    pass

    return {"received": True}

@router.post("/cancel")
def cancel_subscription(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    current_user.subscription_status = "cancelled"
    db.commit()
    return {"message": "Suscripción cancelada. Permanecerá activa hasta la fecha de vencimiento."}
