from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..core.database import Base

class PrescriptionStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String)
    doctor_name = Column(String, nullable=True)
    hospital_name = Column(String, nullable=True)
    issue_date = Column(DateTime(timezone=True), nullable=True)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(PrescriptionStatus), default=PrescriptionStatus.PENDING)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="prescriptions")
    verifier = relationship("User", foreign_keys=[verified_by])
    prescription_medicines = relationship("PrescriptionMedicine", back_populates="prescription")

class PrescriptionMedicine(Base):
    __tablename__ = "prescription_medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    prescription = relationship("Prescription", back_populates="prescription_medicines")
    medicine = relationship("Medicine", back_populates="prescription_medicines") 