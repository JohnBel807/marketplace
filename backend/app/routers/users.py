from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas import UserOut, UserUpdate

router = APIRouter()

@router.get("/", response_model=list[UserOut])
def list_users(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Solo administradores")
    return db.query(User).all()

@router.put("/me", response_model=UserOut)
def update_profile(user_data: UserUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    for field, value in user_data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
