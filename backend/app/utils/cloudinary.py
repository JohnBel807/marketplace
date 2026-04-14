import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_image(file: UploadFile, folder: str = "velezyricaurte") -> str:
    allowed = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes JPG, PNG o WebP")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="La imagen no puede superar 5MB")

    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        transformation=[{"width": 1200, "height": 900, "crop": "limit", "quality": "auto"}]
    )
    return result["secure_url"]

async def upload_multiple(files: list[UploadFile], folder: str = "velezyricaurte") -> list[str]:
    urls = []
    for file in files[:8]:  # Máximo 8 fotos
        url = await upload_image(file, folder)
        urls.append(url)
    return urls
