from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from ..core.database import get_db
from ..models.user import User
from ..schemas.medicine import (
    Medicine as MedicineSchema, 
    MedicineCreate, 
    MedicineUpdate, 
    MedicineStockUpdate,
    MedicineSearchParams,
    Category as CategorySchema,
    CategoryCreate,
    CategoryUpdate
)
from ..crud import medicine as medicine_crud
from ..utils.auth import get_current_active_user, get_current_pharmacy_admin
from ..utils.file_upload import save_upload_file, validate_image_extension

router = APIRouter(
    prefix="/medicines",
    tags=["medicines"]
)

# Medicine endpoints
@router.get("/", response_model=List[MedicineSchema])
async def get_medicines(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return medicine_crud.get_medicines(db=db, skip=skip, limit=limit)

@router.post("/", response_model=MedicineSchema)
async def create_medicine(
    name: str = Form(...),
    description: str = Form(...),
    manufacturer: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    prescription_required: bool = Form(False),
    dosage_form: str = Form(...),
    strength: str = Form(...),
    category_ids: str = Form(...),  # JSON string of category IDs
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_pharmacy_admin),
    db: Session = Depends(get_db)
):
    # Parse category IDs from JSON string
    try:
        category_ids_list = json.loads(category_ids)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid category_ids format")
    
    # Handle image upload if provided
    image_url = None
    if image:
        if not validate_image_extension(image.filename):
            raise HTTPException(status_code=400, detail="Invalid image format")
        image_url = await save_upload_file(image, "medicines")
    
    # Create medicine schema
    medicine_data = MedicineCreate(
        name=name,
        description=description,
        manufacturer=manufacturer,
        price=price,
        stock=stock,
        prescription_required=prescription_required,
        image_url=image_url,
        dosage_form=dosage_form,
        strength=strength,
        category_ids=category_ids_list
    )
    
    return medicine_crud.create_medicine(db=db, medicine=medicine_data)

@router.get("/{medicine_id}", response_model=MedicineSchema)
async def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    medicine = medicine_crud.get_medicine(db=db, medicine_id=medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine

@router.put("/{medicine_id}", response_model=MedicineSchema)
async def update_medicine(
    medicine_id: int,
    medicine: MedicineUpdate,
    current_user: User = Depends(get_current_pharmacy_admin),
    db: Session = Depends(get_db)
):
    return medicine_crud.update_medicine(db=db, medicine_id=medicine_id, medicine=medicine)

@router.delete("/{medicine_id}")
async def delete_medicine(
    medicine_id: int,
    current_user: User = Depends(get_current_pharmacy_admin),
    db: Session = Depends(get_db)
):
    medicine_crud.delete_medicine(db=db, medicine_id=medicine_id)
    return {"message": "Medicine deleted successfully"}

@router.patch("/{medicine_id}/stock", response_model=MedicineSchema)
async def update_medicine_stock(
    medicine_id: int,
    stock_update: MedicineStockUpdate,
    current_user: User = Depends(get_current_pharmacy_admin),
    db: Session = Depends(get_db)
):
    return medicine_crud.update_medicine_stock(db=db, medicine_id=medicine_id, stock_update=stock_update)

@router.get("/search/", response_model=List[MedicineSchema])
async def search_medicines(
    q: Optional[str] = None,
    category_id: Optional[int] = None,
    prescription_required: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    search_params = MedicineSearchParams(
        q=q,
        category_id=category_id,
        prescription_required=prescription_required,
        min_price=min_price,
        max_price=max_price
    )
    return medicine_crud.search_medicines(db=db, search_params=search_params, skip=skip, limit=limit)

@router.get("/{medicine_id}/alternatives", response_model=List[MedicineSchema])
async def get_medicine_alternatives(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    return medicine_crud.get_medicine_alternatives(db=db, medicine_id=medicine_id)

# Category endpoints
category_router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)

@category_router.get("/", response_model=List[CategorySchema])
async def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return medicine_crud.get_categories(db=db, skip=skip, limit=limit)

@category_router.post("/", response_model=CategorySchema)
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_pharmacy_admin),
    db: Session = Depends(get_db)
):
    return medicine_crud.create_category(db=db, category=category)

@category_router.get("/{category_id}", response_model=CategorySchema)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = medicine_crud.get_category(db=db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@category_router.put("/{category_id}", response_model=CategorySchema)
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    current_user: User = Depends(get_current_pharmacy_admin),
    db: Session = Depends(get_db)
):
    return medicine_crud.update_category(db=db, category_id=category_id, category=category)

@category_router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_pharmacy_admin),
    db: Session = Depends(get_db)
):
    medicine_crud.delete_category(db=db, category_id=category_id)
    return {"message": "Category deleted successfully"} 