from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from typing import List, Optional, Dict, Any

from ..models.medicine import Medicine, Category
from ..schemas.medicine import MedicineCreate, MedicineUpdate, CategoryCreate, CategoryUpdate, MedicineStockUpdate, MedicineSearchParams

# Category CRUD operations
def get_category(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()

def get_category_by_name(db: Session, name: str) -> Optional[Category]:
    return db.query(Category).filter(Category.name == name).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    return db.query(Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: CategoryCreate) -> Category:
    db_category = get_category_by_name(db, name=category.name)
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: CategoryUpdate) -> Category:
    db_category = get_category(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.dict(exclude_unset=True)
    
    # Check if name is being updated and if it already exists
    if "name" in update_data and update_data["name"] != db_category.name:
        existing_category = get_category_by_name(db, name=update_data["name"])
        if existing_category:
            raise HTTPException(status_code=400, detail="Category name already exists")
    
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int) -> bool:
    db_category = get_category(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has medicines
    if db_category.medicines:
        raise HTTPException(status_code=400, detail="Cannot delete category with associated medicines")
    
    db.delete(db_category)
    db.commit()
    return True

# Medicine CRUD operations
def get_medicine(db: Session, medicine_id: int) -> Optional[Medicine]:
    return db.query(Medicine).filter(Medicine.id == medicine_id).first()

def get_medicines(db: Session, skip: int = 0, limit: int = 100) -> List[Medicine]:
    return db.query(Medicine).offset(skip).limit(limit).all()

def create_medicine(db: Session, medicine: MedicineCreate) -> Medicine:
    # Check if all categories exist
    for category_id in medicine.category_ids:
        db_category = get_category(db, category_id)
        if not db_category:
            raise HTTPException(status_code=404, detail=f"Category with id {category_id} not found")
    
    # Create medicine without categories first
    medicine_data = medicine.dict(exclude={"category_ids"})
    db_medicine = Medicine(**medicine_data)
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    
    # Add categories
    for category_id in medicine.category_ids:
        db_category = get_category(db, category_id)
        db_medicine.categories.append(db_category)
    
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

def update_medicine(db: Session, medicine_id: int, medicine: MedicineUpdate) -> Medicine:
    db_medicine = get_medicine(db, medicine_id)
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    update_data = medicine.dict(exclude={"category_ids"}, exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_medicine, key, value)
    
    # Update categories if provided
    if medicine.category_ids is not None:
        # Clear existing categories
        db_medicine.categories = []
        
        # Add new categories
        for category_id in medicine.category_ids:
            db_category = get_category(db, category_id)
            if not db_category:
                raise HTTPException(status_code=404, detail=f"Category with id {category_id} not found")
            db_medicine.categories.append(db_category)
    
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

def update_medicine_stock(db: Session, medicine_id: int, stock_update: MedicineStockUpdate) -> Medicine:
    db_medicine = get_medicine(db, medicine_id)
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    db_medicine.stock = stock_update.stock
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

def delete_medicine(db: Session, medicine_id: int) -> bool:
    db_medicine = get_medicine(db, medicine_id)
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    db.delete(db_medicine)
    db.commit()
    return True

def search_medicines(db: Session, search_params: MedicineSearchParams, skip: int = 0, limit: int = 100) -> List[Medicine]:
    query = db.query(Medicine)
    
    # Apply search filters
    if search_params.q:
        query = query.filter(
            or_(
                Medicine.name.ilike(f"%{search_params.q}%"),
                Medicine.description.ilike(f"%{search_params.q}%"),
                Medicine.manufacturer.ilike(f"%{search_params.q}%")
            )
        )
    
    if search_params.category_id is not None:
        query = query.filter(Medicine.categories.any(Category.id == search_params.category_id))
    
    if search_params.prescription_required is not None:
        query = query.filter(Medicine.prescription_required == search_params.prescription_required)
    
    if search_params.min_price is not None:
        query = query.filter(Medicine.price >= search_params.min_price)
    
    if search_params.max_price is not None:
        query = query.filter(Medicine.price <= search_params.max_price)
    
    return query.offset(skip).limit(limit).all()

def get_medicine_alternatives(db: Session, medicine_id: int) -> List[Medicine]:
    db_medicine = get_medicine(db, medicine_id)
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Get medicines in the same categories
    category_ids = [category.id for category in db_medicine.categories]
    
    alternatives = db.query(Medicine).filter(
        Medicine.id != medicine_id,
        Medicine.categories.any(Category.id.in_(category_ids))
    ).all()
    
    return alternatives 