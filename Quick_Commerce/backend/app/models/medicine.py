from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

# Many-to-many relationship between medicines and categories
medicine_category = Table(
    "medicine_category",
    Base.metadata,
    Column("medicine_id", Integer, ForeignKey("medicines.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True)
)

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    manufacturer = Column(String)
    price = Column(Float)
    stock = Column(Integer)
    prescription_required = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
    dosage_form = Column(String)  # tablet, capsule, syrup, etc.
    strength = Column(String)  # 500mg, 250ml, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    categories = relationship("Category", secondary=medicine_category, back_populates="medicines")
    cart_items = relationship("CartItem", back_populates="medicine")
    order_items = relationship("OrderItem", back_populates="medicine")
    prescription_medicines = relationship("PrescriptionMedicine", back_populates="medicine")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    medicines = relationship("Medicine", secondary=medicine_category, back_populates="categories") 