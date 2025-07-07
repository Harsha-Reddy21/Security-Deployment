from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    phone_verified = Column(Boolean, default=False)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_pharmacy_admin = Column(Boolean, default=False)
    is_delivery_partner = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    addresses = relationship("Address", back_populates="user")
    prescriptions = relationship("Prescription", back_populates="user", foreign_keys="Prescription.user_id")
    verified_prescriptions = relationship("Prescription", foreign_keys="Prescription.verified_by")
    cart = relationship("Cart", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    medical_profile = relationship("MedicalProfile", back_populates="user", uselist=False)

class Address(Base):
    __tablename__ = "addresses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    address_line1 = Column(String)
    address_line2 = Column(String, nullable=True)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="addresses")

class MedicalProfile(Base):
    __tablename__ = "medical_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    date_of_birth = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    allergies = Column(String, nullable=True)
    chronic_diseases = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="medical_profile") 