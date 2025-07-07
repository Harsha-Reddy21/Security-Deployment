from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from ..core.database import get_db
from ..models.user import User
from ..schemas.prescription import (
    Prescription as PrescriptionSchema,
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionVerify,
    PrescriptionMedicine as PrescriptionMedicineSchema,
    PrescriptionMedicineCreate,
    PrescriptionUpload
)
from ..crud import prescription as prescription_crud
from ..utils.auth import get_current_active_user, get_current_pharmacy_admin
from ..utils.file_upload import save_upload_file, validate_image_extension

router = APIRouter(
    prefix="/prescriptions",
    tags=["prescriptions"]
)

@router.get("/", response_model=List[PrescriptionSchema])
async def get_prescriptions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return prescription_crud.get_user_prescriptions(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/upload", response_model=PrescriptionSchema)
async def upload_prescription(
    prescription_image: UploadFile = File(...),
    doctor_name: Optional[str] = Form(None),
    hospital_name: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    medicines_json: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Validate image
    if not validate_image_extension(prescription_image.filename):
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    # Save prescription image
    image_url = await save_upload_file(prescription_image, "prescriptions")
    
    # Parse dates if provided
    issue_date_obj = None
    expiry_date_obj = None
    
    if issue_date:
        try:
            issue_date_obj = datetime.fromisoformat(issue_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid issue date format")
    
    if expiry_date:
        try:
            expiry_date_obj = datetime.fromisoformat(expiry_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid expiry date format")
    
    # Create prescription
    prescription_data = PrescriptionCreate(
        doctor_name=doctor_name,
        hospital_name=hospital_name,
        issue_date=issue_date_obj,
        expiry_date=expiry_date_obj
    )
    
    prescription = prescription_crud.create_prescription(
        db=db, 
        user_id=current_user.id, 
        image_url=image_url, 
        prescription=prescription_data
    )
    
    # Add medicines if provided
    if medicines_json:
        try:
            medicines_data = json.loads(medicines_json)
            for medicine_data in medicines_data:
                medicine = PrescriptionMedicineCreate(**medicine_data)
                prescription_crud.create_prescription_medicine(
                    db=db,
                    prescription_id=prescription.id,
                    medicine=medicine
                )
        except (json.JSONDecodeError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid medicines data format")
    
    # Refresh prescription to include medicines
    db.refresh(prescription)
    return prescription

@router.get("/{prescription_id}", response_model=PrescriptionSchema)
async def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescription = prescription_crud.get_prescription(db=db, prescription_id=prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Check if user owns the prescription or is a pharmacy admin
    if prescription.user_id != current_user.id and not current_user.is_pharmacy_admin and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this prescription")
    
    return prescription

@router.put("/{prescription_id}/verify", response_model=PrescriptionSchema)
async def verify_prescription(
    prescription_id: int,
    verification: PrescriptionVerify,
    current_user: User = Depends(get_current_pharmacy_admin),
    db: Session = Depends(get_db)
):
    return prescription_crud.verify_prescription(
        db=db, 
        prescription_id=prescription_id, 
        verifier_id=current_user.id, 
        verification=verification
    )

@router.get("/{prescription_id}/medicines", response_model=List[PrescriptionMedicineSchema])
async def get_prescription_medicines(
    prescription_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescription = prescription_crud.get_prescription(db=db, prescription_id=prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Check if user owns the prescription or is a pharmacy admin
    if prescription.user_id != current_user.id and not current_user.is_pharmacy_admin and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this prescription")
    
    return prescription_crud.get_prescription_medicines(db=db, prescription_id=prescription_id) 