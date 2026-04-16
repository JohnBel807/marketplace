from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token, get_current_active_user
from app.models.user import User, SubscriptionPlan
from app.schemas import UserRegister, Token, UserOut
from app.utils.email import send_welcome_email

router = APIRouter()

TRIAL_DAYS = 30

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
        # Trial automático de 30 días
        subscription_plan=SubscriptionPlan.TRIAL,
        subscription_status="active",
        trial_started_at=now,
        trial_expires_at=trial_expires,
        trial_used=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Enviar email de bienvenida en background
    background_tasks.add_task(
        send_welcome_email,
        full_name=user.full_name,
        email=user.email,
        trial_days=TRIAL_DAYS
    )

    return user

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

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
