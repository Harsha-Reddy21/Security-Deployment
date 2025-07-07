from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None

class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class MedicineBase(BaseModel):
    name: str
    description: str
    manufacturer: str
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    prescription_required: bool = False
    image_url: Optional[str] = None
    dosage_form: str  # tablet, capsule, syrup, etc.
    strength: str  # 500mg, 250ml, etc.

class MedicineCreate(MedicineBase):
    category_ids: List[int]

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    prescription_required: Optional[bool] = None
    image_url: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    category_ids: Optional[List[int]] = None

class MedicineStockUpdate(BaseModel):
    stock: int = Field(..., ge=0)

class MedicineSearchParams(BaseModel):
    q: Optional[str] = None
    category_id: Optional[int] = None
    prescription_required: Optional[bool] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None

class Medicine(MedicineBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    categories: List[Category] = []
    
    class Config:
        orm_mode = True 