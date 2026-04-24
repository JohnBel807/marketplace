from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token, get_current_active_user
from app.models.user import User, SubscriptionPlan
from app.models.password_reset import PasswordResetToken
from app.schemas import UserRegister, Token, UserOut
from app.utils.email import send_welcome_email, send_password_reset_email
from app.core.config import settings

router = APIRouter()

TRIAL_DAYS = 30

# ── Schemas locales ───────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ── Register ──────────────────────────────────────────────────────
@router.post("/register", response_model=UserOut, status_code=201)
def register(
    user_data: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    now = datetime.utcnow()
    trial_expires = now + timedelta(days=TRIAL_DAYS)

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        city=user_data.city or "Vélez",
        hashed_password=hash_password(user_data.password),
        subscription_plan=SubscriptionPlan.TRIAL,
        subscription_status="active",
        trial_started_at=now,
        trial_expires_at=trial_expires,
        trial_used=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    background_tasks.add_task(
        send_welcome_email,
        full_name=user.full_name,
        email=user.email,
        trial_days=TRIAL_DAYS
    )
    return user

# ── Login ─────────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Cuenta desactivada")
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# ── Me ────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# ── Forgot password ───────────────────────────────────────────────
@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email).first()
    # Siempre responder igual para no revelar si el email existe
    if user:
        # Invalidar tokens anteriores
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False
        ).delete()
        db.commit()

        # Crear nuevo token
        reset_token = PasswordResetToken.generate(user_id=user.id)
        db.add(reset_token)
        db.commit()

        # URL del portal (info o com según el origen)
        portal_url = "https://www.velezyricaurte.info"
        reset_url = f"{portal_url}/reset-password?token={reset_token.token}"

        background_tasks.add_task(
            send_password_reset_email,
            full_name=user.full_name,
            email=user.email,
            reset_url=reset_url
        )

    return {"message": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."}

# ── Reset password ────────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")

    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == payload.token
    ).first()

    if not token_record or not token_record.is_valid:
        raise HTTPException(
            status_code=400,
            detail="El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo."
        )

    # Actualizar contraseña
    user = token_record.user
    user.hashed_password = hash_password(payload.new_password)

    # Marcar token como usado
    token_record.used = True

    db.commit()

    return {"message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."}

# ── Verify reset token ────────────────────────────────────────────
@router.get("/verify-reset-token/{token}")
def verify_reset_token(token: str, db: Session = Depends(get_db)):
    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()

    if not token_record or not token_record.is_valid:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    return {"valid": True, "email": token_record.user.email}

