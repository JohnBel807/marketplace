from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel
from enum import Enum
import hashlib, hmac, json, logging
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.core.config import settings
from app.models.user import User, SubscriptionPlan
from app.utils.email import send_email

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────
class BillingPeriod(str, Enum):
    MONTHLY = "monthly"
    ANNUAL = "annual"

class SubscriptionCreate(BaseModel):
    plan: SubscriptionPlan
    period: BillingPeriod = BillingPeriod.MONTHLY

# ── Tabla de precios ──────────────────────────────────────────────
PLAN_CONFIG = {
    SubscriptionPlan.BASIC: {
        "label": "Plan Básico",
        "monthly_price": 19900,
        "annual_price": 199000,
        "monthly_days": 30,
        "annual_days": 365,
        "max_listings": 5,
        "features": [
            "Hasta 5 anuncios activos",
            "Fotos múltiples (hasta 8)",
            "Contacto directo por WhatsApp",
            "Vigencia según periodo elegido",
        ],
    },
    SubscriptionPlan.PRO: {
        "label": "Plan Pro",
        "monthly_price": 39900,
        "annual_price": 399000,
        "monthly_days": 30,
        "annual_days": 365,
        "max_listings": 20,
        "features": [
            "Hasta 20 anuncios activos",
            "Fotos múltiples (hasta 8)",
            "Estadísticas de vistas",
            "Prioridad en búsqueda",
            "Vigencia según periodo elegido",
        ],
    },
    SubscriptionPlan.PREMIUM: {
        "label": "Plan Premium",
        "monthly_price": 69900,
        "annual_price": 699000,
        "monthly_days": 30,
        "annual_days": 365,
        "max_listings": 9999,
        "features": [
            "Anuncios ilimitados",
            "Destacado en Home",
            "Badge verificado",
            "Soporte prioritario",
            "Vigencia según periodo elegido",
        ],
    },
}

# ── Helpers ───────────────────────────────────────────────────────
def get_price(plan: SubscriptionPlan, period: BillingPeriod) -> int:
    cfg = PLAN_CONFIG[plan]
    return cfg["annual_price"] if period == BillingPeriod.ANNUAL else cfg["monthly_price"]

def get_days(plan: SubscriptionPlan, period: BillingPeriod) -> int:
    cfg = PLAN_CONFIG[plan]
    return cfg["annual_days"] if period == BillingPeriod.ANNUAL else cfg["monthly_days"]

def build_reference(user_id: int, plan: str, period: str) -> str:
    ts = int(datetime.utcnow().timestamp())
    return f"vyr_{user_id}_{plan}_{period}_{ts}"

def verify_wompi_signature(payload: dict, checksum: str, events_secret: str) -> bool:
    try:
        transaction = payload.get("data", {}).get("transaction", {})
        properties = [
            transaction.get("id", ""),
            transaction.get("status", ""),
            transaction.get("amount_in_cents", ""),
            transaction.get("currency", ""),
            payload.get("timestamp", ""),
        ]
        concatenated = "".join(str(p) for p in properties) + events_secret
        expected = hashlib.sha256(concatenated.encode()).hexdigest()
        return hmac.compare_digest(expected, checksum)
    except Exception:
        return False

def send_payment_confirmation(user: User, plan_label: str, period: str, amount: int):
    period_label = "anual" if period == "annual" else "mensual"
    amount_fmt = f"${amount:,.0f}".replace(",", ".")
    html = f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:24px;">✅ Pago confirmado</h1>
<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">VelezYRicaurte Marketplace</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:16px;color:#44403c;">Hola <strong>{user.full_name.split()[0]}</strong>,</p>
<p style="font-size:15px;color:#57534e;">Tu pago fue procesado exitosamente. Ya puedes publicar anuncios.</p>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
<p style="margin:0;font-size:13px;color:#15803d;font-weight:600;text-transform:uppercase;">Plan activado</p>
<p style="margin:4px 0;font-size:28px;font-weight:700;color:#166534;">{plan_label}</p>
<p style="margin:0;font-size:15px;color:#16a34a;">Periodo {period_label} · {amount_fmt} COP</p>
</div>
<div style="text-align:center;">
<a href="https://www.velezyricaurte.info/publish" style="background:#ea580c;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;display:inline-block;">
Publicar mi primer anuncio →
</a>
</div>
</td></tr>
<tr><td style="padding:24px 40px;border-top:1px solid #e7e5e4;text-align:center;">
<p style="margin:0;font-size:13px;color:#78716c;">
<a href="mailto:johnroa@velezyricaurte.com" style="color:#ea580c;">johnroa@velezyricaurte.com</a>
&nbsp;|&nbsp;
<a href="https://wa.me/573116861370" style="color:#16a34a;">WhatsApp</a>
</p>
<p style="margin:8px 0 0;font-size:11px;color:#a8a29e;">Tecnoriente J.B. · NIT 910.168.07-8</p>
</td></tr>
</table></td></tr></table>
</body></html>"""
    send_email(user.email, f"✅ {plan_label} activado — VelezYRicaurte", html)

async def forward_webhook_to_com(payload: dict, checksum: str):
    """Reenvía el webhook al backend de .com para transacciones de ese portal."""
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.COM_PORTAL_API_URL}/subscriptions/wompi-webhook",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "x-event-checksum": checksum,
                }
            )
        logger.info(f"Webhook reenviado a .com: status={resp.status_code}")
    except Exception as e:
        logger.error(f"Error reenviando webhook a .com: {e}")

# ── Endpoints ─────────────────────────────────────────────────────
@router.get("/plans")
def get_plans():
    return [
        {
            "plan": plan.value,
            "label": cfg["label"],
            "monthly_price": cfg["monthly_price"],
            "annual_price": cfg["annual_price"],
            "annual_savings": cfg["monthly_price"] * 12 - cfg["annual_price"],
            "max_listings": cfg["max_listings"],
            "features": cfg["features"],
        }
        for plan, cfg in PLAN_CONFIG.items()
    ]

@router.post("/create-payment-link")
def create_payment_link(
    data: SubscriptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if data.plan not in PLAN_CONFIG:
        raise HTTPException(status_code=400, detail="Plan inválido")

    price = get_price(data.plan, data.period)
    reference = build_reference(current_user.id, data.plan.value, data.period.value)
    redirect_url = "https://www.velezyricaurte.info/dashboard?payment=success"

    # Generar firma de integridad requerida por Wompi en producción
    # SHA256(reference + amount_in_cents + currency + integrity_secret)
    integrity_string = f"{reference}{price * 100}COP{settings.WOMPI_INTEGRITY_SECRET}"
    integrity = hashlib.sha256(integrity_string.encode()).hexdigest()

    checkout_url = (
        f"https://checkout.wompi.co/p/"
        f"?public-key={settings.WOMPI_PUBLIC_KEY}"
        f"&currency=COP"
        f"&amount-in-cents={price * 100}"
        f"&reference={reference}"
        f"&redirect-url={redirect_url}"
        f"&signature:integrity={integrity}"
        f"&customer-data:email={current_user.email}"
        f"&customer-data:full-name={current_user.full_name}"
    )

    logger.info(f"Payment link: user={current_user.id} plan={data.plan.value} period={data.period.value} amount={price}")

    return {
        "checkout_url": checkout_url,
        "reference": reference,
        "plan": data.plan.value,
        "period": data.period.value,
        "amount": price,
        "label": PLAN_CONFIG[data.plan]["label"],
    }

@router.post("/wompi-webhook")
async def wompi_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    body = await request.body()
    try:
        payload = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Payload inválido")

    checksum = request.headers.get("x-event-checksum", "")
    if settings.WOMPI_EVENTS_SECRET and checksum:
        if not verify_wompi_signature(payload, checksum, settings.WOMPI_EVENTS_SECRET):
            logger.warning("Wompi webhook: firma inválida")
            raise HTTPException(status_code=401, detail="Firma inválida")

    event = payload.get("event", "")
    transaction = payload.get("data", {}).get("transaction", {})
    logger.info(f"Wompi webhook: event={event} status={transaction.get('status')} ref={transaction.get('reference')}")

    if event == "transaction.updated" and transaction.get("status") == "APPROVED":
        reference = transaction.get("reference", "")
        parts = reference.split("_")

        if parts[0] == "vyr":
            # Transacción de .info — procesar aquí
            if len(parts) >= 4:
                try:
                    user_id = int(parts[1])
                    plan_key = parts[2]
                    period_key = parts[3]
                    user = db.query(User).filter(User.id == user_id).first()
                    if not user:
                        logger.error(f"Webhook: usuario {user_id} no encontrado")
                        return {"received": True}
                    plan = SubscriptionPlan(plan_key)
                    period = BillingPeriod(period_key)
                    days = get_days(plan, period)
                    user.subscription_plan = plan
                    user.subscription_status = "active"
                    user.subscription_expires_at = datetime.utcnow() + timedelta(days=days)
                    db.commit()
                    logger.info(f"✅ Plan {plan.value} ({period.value}) activado user={user_id} dias={days}")
                    background_tasks.add_task(
                        send_payment_confirmation,
                        user=user,
                        plan_label=PLAN_CONFIG[plan]["label"],
                        period=period_key,
                        amount=get_price(plan, period)
                    )
                except Exception as e:
                    logger.error(f"Webhook .info error: {reference} → {e}")
        else:
            # Transacción de .com — reenviar al backend de .com
            logger.info(f"Reenviando webhook a .com: ref={reference}")
            background_tasks.add_task(
                forward_webhook_to_com,
                payload=payload,
                checksum=checksum
            )

    return {"received": True}

@router.get("/status")
def get_subscription_status(current_user: User = Depends(get_current_active_user)):
    return {
        "plan": current_user.subscription_plan.value,
        "status": current_user.subscription_status,
        "is_trial": current_user.is_trial,
        "has_active_subscription": current_user.has_active_subscription,
        "trial_days_remaining": current_user.trial_days_remaining,
        "expires_at": current_user.subscription_expires_at.isoformat() if current_user.subscription_expires_at else None,
        "max_listings": current_user.max_listings,
    }

@router.post("/cancel")
def cancel_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    current_user.subscription_status = "cancelled"
    db.commit()
    return {"message": "Suscripción cancelada. Permanecerá activa hasta la fecha de vencimiento."}