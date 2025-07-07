from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Optional
import random
import string
from datetime import datetime, timedelta

from ..models.user import User, Address, MedicalProfile
from ..schemas.user import UserCreate, UserUpdate, AddressCreate, AddressUpdate, MedicalProfileCreate, MedicalProfileUpdate
from ..core.security import get_password_hash, verify_password, create_access_token

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
    return db.query(User).filter(User.phone == phone).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = get_user_by_phone(db, phone=user.phone)
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create a medical profile for the user
    db_medical_profile = MedicalProfile(user_id=db_user.id)
    db.add(db_medical_profile)
    db.commit()
    
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def update_user(db: Session, user_id: int, user: UserUpdate) -> User:
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_password(db: Session, user_id: int, current_password: str, new_password: str) -> User:
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    db_user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user

def generate_verification_code() -> str:
    return ''.join(random.choices(string.digits, k=6))

def verify_phone(db: Session, user_id: int, phone: str, verification_code: str) -> User:
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db_user.phone != phone:
        raise HTTPException(status_code=400, detail="Phone number does not match")
    
    # In a real application, we would verify the code against a stored code
    # For this example, we'll just mark the phone as verified
    db_user.phone_verified = True
    db.commit()
    db.refresh(db_user)
    return db_user

# Address CRUD operations
def get_addresses(db: Session, user_id: int) -> List[Address]:
    return db.query(Address).filter(Address.user_id == user_id).all()

def get_address(db: Session, address_id: int, user_id: int) -> Optional[Address]:
    return db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()

def create_address(db: Session, address: AddressCreate, user_id: int) -> Address:
    # If this is the default address, unset any existing default
    if address.is_default:
        db.query(Address).filter(Address.user_id == user_id, Address.is_default == True).update({"is_default": False})
    
    db_address = Address(**address.dict(), user_id=user_id)
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

def update_address(db: Session, address_id: int, address: AddressUpdate, user_id: int) -> Address:
    db_address = get_address(db, address_id, user_id)
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # If this is being set as default, unset any existing default
    if address.is_default:
        db.query(Address).filter(Address.user_id == user_id, Address.is_default == True, Address.id != address_id).update({"is_default": False})
    
    update_data = address.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_address, key, value)
    
    db.commit()
    db.refresh(db_address)
    return db_address

def delete_address(db: Session, address_id: int, user_id: int) -> bool:
    db_address = get_address(db, address_id, user_id)
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    db.delete(db_address)
    db.commit()
    return True

# Medical Profile CRUD operations
def get_medical_profile(db: Session, user_id: int) -> Optional[MedicalProfile]:
    return db.query(MedicalProfile).filter(MedicalProfile.user_id == user_id).first()

def update_medical_profile(db: Session, user_id: int, profile: MedicalProfileUpdate) -> MedicalProfile:
    db_profile = get_medical_profile(db, user_id)
    if not db_profile:
        # Create if it doesn't exist
        db_profile = MedicalProfile(user_id=user_id, **profile.dict(exclude_unset=True))
        db.add(db_profile)
    else:
        # Update existing profile
        update_data = profile.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile 