from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

class AddressBase(BaseModel):
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(AddressBase):
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None

class Address(AddressBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class MedicalProfileBase(BaseModel):
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    chronic_diseases: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class MedicalProfileCreate(MedicalProfileBase):
    pass

class MedicalProfileUpdate(MedicalProfileBase):
    pass

class MedicalProfile(MedicalProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: EmailStr
    phone: str
    full_name: str

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    
class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str
    
    @validator('new_password')
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PhoneVerification(BaseModel):
    phone: str
    verification_code: str

class User(UserBase):
    id: int
    phone_verified: bool
    is_active: bool
    is_admin: bool
    is_pharmacy_admin: bool
    is_delivery_partner: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    addresses: List[Address] = []
    medical_profile: Optional[MedicalProfile] = None
    
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None 