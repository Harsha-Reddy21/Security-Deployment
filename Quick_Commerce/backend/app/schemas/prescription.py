from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..models.prescription import PrescriptionStatus

class PrescriptionMedicineBase(BaseModel):
    medicine_id: int
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    notes: Optional[str] = None

class PrescriptionMedicineCreate(PrescriptionMedicineBase):
    pass

class PrescriptionMedicine(PrescriptionMedicineBase):
    id: int
    prescription_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class PrescriptionBase(BaseModel):
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(PrescriptionBase):
    pass

class PrescriptionVerify(BaseModel):
    status: PrescriptionStatus
    verification_notes: Optional[str] = None

class PrescriptionUpload(BaseModel):
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    medicines: Optional[List[PrescriptionMedicineCreate]] = None

class Prescription(PrescriptionBase):
    id: int
    user_id: int
    image_url: str
    status: PrescriptionStatus
    verified_by: Optional[int] = None
    verification_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    prescription_medicines: List[PrescriptionMedicine] = []
    
    class Config:
        orm_mode = True 