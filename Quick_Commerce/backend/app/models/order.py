from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, DateTime, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..core.database import Base

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PACKED = "packed"
    SHIPPED = "shipped"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class DeliveryType(str, enum.Enum):
    STANDARD = "standard"
    EXPRESS = "express"
    EMERGENCY = "emergency"

class Cart(Base):
    __tablename__ = "carts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cart")
    cart_items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    quantity = Column(Integer, default=1)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    cart = relationship("Cart", back_populates="cart_items")
    medicine = relationship("Medicine", back_populates="cart_items")
    prescription = relationship("Prescription", foreign_keys=[prescription_id])

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    address_id = Column(Integer, ForeignKey("addresses.id"))
    total_amount = Column(Float)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    delivery_type = Column(Enum(DeliveryType), default=DeliveryType.STANDARD)
    delivery_fee = Column(Float, default=0.0)
    delivery_partner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    estimated_delivery_time = Column(DateTime(timezone=True), nullable=True)
    actual_delivery_time = Column(DateTime(timezone=True), nullable=True)
    delivery_notes = Column(String, nullable=True)
    payment_method = Column(String)
    payment_status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="orders")
    address = relationship("Address")
    delivery_partner = relationship("User", foreign_keys=[delivery_partner_id])
    order_items = relationship("OrderItem", back_populates="order")
    tracking_updates = relationship("OrderTracking", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    quantity = Column(Integer)
    unit_price = Column(Float)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    medicine = relationship("Medicine", back_populates="order_items")
    prescription = relationship("Prescription")

class OrderTracking(Base):
    __tablename__ = "order_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    status = Column(Enum(OrderStatus))
    location = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="tracking_updates") 