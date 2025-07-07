from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional
import os
from datetime import datetime

from ..models.prescription import Prescription, PrescriptionMedicine, PrescriptionStatus
from ..schemas.prescription import PrescriptionCreate, PrescriptionUpdate, PrescriptionVerify, PrescriptionMedicineCreate

def get_prescription(db: Session, prescription_id: int) -> Optional[Prescription]:
    return db.query(Prescription).filter(Prescription.id == prescription_id).first()

def get_user_prescriptions(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Prescription]:
    return db.query(Prescription).filter(Prescription.user_id == user_id).offset(skip).limit(limit).all()

def create_prescription(db: Session, user_id: int, image_url: str, prescription: PrescriptionCreate) -> Prescription:
    db_prescription = Prescription(
        user_id=user_id,
        image_url=image_url,
        **prescription.dict()
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

def update_prescription(db: Session, prescription_id: int, prescription: PrescriptionUpdate) -> Prescription:
    db_prescription = get_prescription(db, prescription_id)
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    update_data = prescription.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_prescription, key, value)
    
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

def verify_prescription(db: Session, prescription_id: int, verifier_id: int, verification: PrescriptionVerify) -> Prescription:
    db_prescription = get_prescription(db, prescription_id)
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    db_prescription.status = verification.status
    db_prescription.verified_by = verifier_id
    db_prescription.verification_notes = verification.verification_notes
    
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

def delete_prescription(db: Session, prescription_id: int) -> bool:
    db_prescription = get_prescription(db, prescription_id)
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Delete associated prescription medicines first
    db.query(PrescriptionMedicine).filter(PrescriptionMedicine.prescription_id == prescription_id).delete()
    
    db.delete(db_prescription)
    db.commit()
    return True

# Prescription Medicine CRUD operations
def get_prescription_medicine(db: Session, prescription_medicine_id: int) -> Optional[PrescriptionMedicine]:
    return db.query(PrescriptionMedicine).filter(PrescriptionMedicine.id == prescription_medicine_id).first()

def get_prescription_medicines(db: Session, prescription_id: int) -> List[PrescriptionMedicine]:
    return db.query(PrescriptionMedicine).filter(PrescriptionMedicine.prescription_id == prescription_id).all()

def create_prescription_medicine(db: Session, prescription_id: int, medicine: PrescriptionMedicineCreate) -> PrescriptionMedicine:
    db_prescription_medicine = PrescriptionMedicine(
        prescription_id=prescription_id,
        **medicine.dict()
    )
    db.add(db_prescription_medicine)
    db.commit()
    db.refresh(db_prescription_medicine)
    return db_prescription_medicine

def delete_prescription_medicine(db: Session, prescription_medicine_id: int) -> bool:
    db_prescription_medicine = get_prescription_medicine(db, prescription_medicine_id)
    if not db_prescription_medicine:
        raise HTTPException(status_code=404, detail="Prescription medicine not found")
    
    db.delete(db_prescription_medicine)
    db.commit()
    return True

def is_prescription_valid_for_medicine(db: Session, user_id: int, medicine_id: int) -> Optional[Prescription]:
    """Check if user has a valid prescription for a medicine"""
    valid_prescriptions = db.query(Prescription).filter(
        Prescription.user_id == user_id,
        Prescription.status == PrescriptionStatus.VERIFIED,
        Prescription.prescription_medicines.any(PrescriptionMedicine.medicine_id == medicine_id)
    ).all()
    
    # Find a non-expired prescription
    now = datetime.now()
    for prescription in valid_prescriptions:
        if prescription.expiry_date is None or prescription.expiry_date > now:
            return prescription
    
    return None 