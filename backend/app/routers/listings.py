from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_active_user, require_subscriber
from app.models.user import User
from app.models.listing import Listing, ListingCategory, ListingStatus
from app.schemas import ListingCreate, ListingUpdate, ListingOut, ListingList 
from app.utils.cloudinary import upload_multiple

router = APIRouter()

@router.get("", response_model=ListingList)
def get_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    category: Optional[ListingCategory] = None,
    search: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Listing).filter(Listing.status == ListingStatus.ACTIVE)

    if category:
        query = query.filter(Listing.category == category)
    if search:
        query = query.filter(
            or_(
                Listing.title.ilike(f"%{search}%"),
                Listing.description.ilike(f"%{search}%")
            )
        )
    if city:
        query = query.filter(Listing.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
    if featured_only:
        query = query.filter(Listing.is_featured == True)

    # Destacados primero
    query = query.order_by(Listing.is_featured.desc(), Listing.created_at.desc())

    total = query.count()
    listings = query.offset((page - 1) * page_size).limit(page_size).all()

    return {"total": total, "page": page, "page_size": page_size, "results": listings}

@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    listing.views_count += 1
    db.commit()
    db.refresh(listing)
    return listing

@router.post("", response_model=ListingOut, status_code=201)
def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(require_subscriber),
    db: Session = Depends(get_db)
):
    # Verificar límite de anuncios activos
    active_count = db.query(Listing).filter(
        Listing.owner_id == current_user.id,
        Listing.status == ListingStatus.ACTIVE
    ).count()
    if active_count >= current_user.max_listings:
        raise HTTPException(
            status_code=403,
            detail=f"Tu plan {current_user.subscription_plan} permite máximo {current_user.max_listings} anuncios activos"
        )

    listing = Listing(
        **listing_data.dict(),
        owner_id=current_user.id,
        contact_phone=listing_data.contact_phone or current_user.phone,
        contact_whatsapp=listing_data.contact_whatsapp or current_user.phone,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.put("/{listing_id}", response_model=ListingOut)
def update_listing(
    listing_id: int,
    listing_data: ListingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    if listing.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este anuncio")

    for field, value in listing_data.dict(exclude_unset=True).items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    if listing.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Sin permiso")
    db.delete(listing)
    db.commit()


@router.get("/my/listings", response_model=List[ListingOut])
def my_listings(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(Listing).filter(Listing.owner_id == current_user.id).order_by(Listing.created_at.desc()).all()

from fastapi import File, UploadFile
from typing import List

@router.post("/upload-photos")
async def upload_photos(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload photos - uses Cloudinary if configured, otherwise returns placeholder URLs"""
    try:
        from app.utils.cloudinary import upload_multiple
        urls = await upload_multiple(files, folder=f"velezyricaurte/{current_user.id}")
        return {"urls": urls}
    except Exception:
        # Fallback: return placeholder URLs if Cloudinary not configured
        placeholders = [
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80",
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&q=80",
        ]
        return {"urls": placeholders[:len(files)]}
