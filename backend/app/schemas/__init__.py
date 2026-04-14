from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.user import SubscriptionPlan
from app.models.listing import ListingCategory, ListingStatus, ListingCondition

# ── AUTH ──────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    city: Optional[str] = "Vélez"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ── USERS ─────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    city: str
    avatar_url: Optional[str]
    subscription_plan: SubscriptionPlan
    subscription_status: str
    has_active_subscription: bool
    max_listings: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    avatar_url: Optional[str] = None

# ── LISTINGS ──────────────────────────────────────────────────────
class ListingCreate(BaseModel):
    title: str
    description: str
    price: Optional[float] = None
    price_negotiable: bool = False
    category: ListingCategory
    subcategory: Optional[str] = None
    condition: ListingCondition = ListingCondition.USED
    city: str = "Vélez"
    municipality: Optional[str] = None
    photos: List[str] = []
    thumbnail_url: Optional[str] = None
    attributes: Dict[str, Any] = {}
    contact_phone: Optional[str] = None
    contact_whatsapp: Optional[str] = None
    contact_email: Optional[str] = None

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    price_negotiable: Optional[bool] = None
    condition: Optional[ListingCondition] = None
    status: Optional[ListingStatus] = None
    photos: Optional[List[str]] = None
    thumbnail_url: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None
    contact_phone: Optional[str] = None

class ListingOut(BaseModel):
    id: int
    title: str
    description: str
    price: Optional[float]
    price_negotiable: bool
    category: ListingCategory
    subcategory: Optional[str]
    condition: ListingCondition
    status: ListingStatus
    city: str
    municipality: Optional[str]
    department: str
    photos: List[str]
    thumbnail_url: Optional[str]
    attributes: Dict[str, Any]
    is_featured: bool
    contact_phone: Optional[str]
    contact_whatsapp: Optional[str]
    contact_email: Optional[str]
    views_count: int
    owner_id: int
    owner: UserOut
    created_at: datetime

    class Config:
        from_attributes = True

class ListingList(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[ListingOut]

# ── SUBSCRIPTIONS ─────────────────────────────────────────────────
class SubscriptionCreate(BaseModel):
    plan: SubscriptionPlan

class WompiWebhook(BaseModel):
    event: str
    data: Dict[str, Any]
    sent_at: str
    timestamp: int
    signature: Dict[str, Any]
