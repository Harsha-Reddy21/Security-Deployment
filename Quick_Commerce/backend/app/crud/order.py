from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from ..models.order import Cart, CartItem, Order, OrderItem, OrderTracking, OrderStatus, DeliveryType
from ..models.medicine import Medicine
from ..schemas.order import CartItemCreate, CartItemUpdate, OrderCreate, OrderUpdate, OrderTrackingCreate, DeliveryProof
from .prescription import is_prescription_valid_for_medicine

# Cart CRUD operations
def get_user_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        # Create a new cart if one doesn't exist
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def get_cart_item(db: Session, cart_item_id: int, user_id: int) -> Optional[CartItem]:
    return db.query(CartItem).join(Cart).filter(
        CartItem.id == cart_item_id,
        Cart.user_id == user_id
    ).first()

def add_cart_item(db: Session, user_id: int, item: CartItemCreate) -> CartItem:
    # Get or create user's cart
    cart = get_user_cart(db, user_id)
    
    # Check if medicine exists
    medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Check if medicine requires prescription
    if medicine.prescription_required:
        if item.prescription_id is None:
            raise HTTPException(status_code=400, detail="Prescription required for this medicine")
        
        # Validate prescription
        valid_prescription = is_prescription_valid_for_medicine(db, user_id, item.medicine_id)
        if not valid_prescription or valid_prescription.id != item.prescription_id:
            raise HTTPException(status_code=400, detail="Invalid or expired prescription for this medicine")
    
    # Check if item already exists in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.medicine_id == item.medicine_id
    ).first()
    
    if existing_item:
        # Update quantity if item already exists
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        # Create new cart item
        db_item = CartItem(
            cart_id=cart.id,
            **item.dict()
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

def update_cart_item(db: Session, cart_item_id: int, user_id: int, item: CartItemUpdate) -> CartItem:
    db_item = get_cart_item(db, cart_item_id, user_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db_item.quantity = item.quantity
    db.commit()
    db.refresh(db_item)
    return db_item

def remove_cart_item(db: Session, cart_item_id: int, user_id: int) -> bool:
    db_item = get_cart_item(db, cart_item_id, user_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(db_item)
    db.commit()
    return True

def clear_cart(db: Session, user_id: int) -> bool:
    cart = get_user_cart(db, user_id)
    
    # Delete all cart items
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    return True

def validate_cart_prescriptions(db: Session, user_id: int) -> Dict:
    cart = get_user_cart(db, user_id)
    
    validation_results = {
        "valid": True,
        "invalid_items": []
    }
    
    for item in cart.cart_items:
        medicine = item.medicine
        if medicine.prescription_required:
            if item.prescription_id is None:
                validation_results["valid"] = False
                validation_results["invalid_items"].append({
                    "cart_item_id": item.id,
                    "medicine_id": medicine.id,
                    "medicine_name": medicine.name,
                    "error": "Prescription required"
                })
            else:
                valid_prescription = is_prescription_valid_for_medicine(db, user_id, medicine.id)
                if not valid_prescription or valid_prescription.id != item.prescription_id:
                    validation_results["valid"] = False
                    validation_results["invalid_items"].append({
                        "cart_item_id": item.id,
                        "medicine_id": medicine.id,
                        "medicine_name": medicine.name,
                        "error": "Invalid or expired prescription"
                    })
    
    return validation_results

# Order CRUD operations
def get_order(db: Session, order_id: int) -> Optional[Order]:
    return db.query(Order).filter(Order.id == order_id).first()

def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def create_order(db: Session, user_id: int, order: OrderCreate) -> Order:
    # Get user's cart
    cart = get_user_cart(db, user_id)
    
    # Check if cart is empty
    if not cart.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Validate prescriptions
    validation = validate_cart_prescriptions(db, user_id)
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail="Invalid prescriptions in cart", headers={"X-Prescription-Validation": str(validation)})
    
    # Calculate total amount
    total_amount = 0
    for item in cart.cart_items:
        total_amount += item.medicine.price * item.quantity
    
    # Calculate delivery fee based on delivery type
    delivery_fee = 0
    if order.delivery_type == DeliveryType.EXPRESS:
        delivery_fee = 50  # Example fee
    elif order.delivery_type == DeliveryType.EMERGENCY:
        delivery_fee = 100  # Example fee
    
    # Create order
    db_order = Order(
        user_id=user_id,
        total_amount=total_amount,
        delivery_fee=delivery_fee,
        payment_status="pending",
        **order.dict()
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items from cart items
    for cart_item in cart.cart_items:
        order_item = OrderItem(
            order_id=db_order.id,
            medicine_id=cart_item.medicine_id,
            quantity=cart_item.quantity,
            unit_price=cart_item.medicine.price,
            prescription_id=cart_item.prescription_id
        )
        db.add(order_item)
        
        # Update medicine stock
        medicine = cart_item.medicine
        if medicine.stock < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {medicine.name}")
        medicine.stock -= cart_item.quantity
    
    # Create initial tracking entry
    tracking = OrderTracking(
        order_id=db_order.id,
        status=OrderStatus.PENDING,
        notes="Order received"
    )
    db.add(tracking)
    
    # Clear the cart
    clear_cart(db, user_id)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_status(db: Session, order_id: int, order_update: OrderUpdate) -> Order:
    db_order = get_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order status
    db_order.status = order_update.status
    
    # Update other fields if provided
    update_data = order_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
    
    # Add tracking update
    tracking = OrderTracking(
        order_id=order_id,
        status=order_update.status
    )
    db.add(tracking)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order_tracking(db: Session, order_id: int) -> List[OrderTracking]:
    return db.query(OrderTracking).filter(OrderTracking.order_id == order_id).order_by(OrderTracking.created_at).all()

def add_order_tracking(db: Session, order_id: int, tracking: OrderTrackingCreate) -> OrderTracking:
    db_order = get_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_tracking = OrderTracking(
        order_id=order_id,
        **tracking.dict()
    )
    db.add(db_tracking)
    
    # Update order status
    db_order.status = tracking.status
    
    db.commit()
    db.refresh(db_tracking)
    return db_tracking

def add_delivery_proof(db: Session, order_id: int, proof: DeliveryProof) -> Order:
    db_order = get_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order status to delivered
    db_order.status = OrderStatus.DELIVERED
    db_order.actual_delivery_time = datetime.now()
    
    # Add tracking update
    tracking = OrderTracking(
        order_id=order_id,
        status=OrderStatus.DELIVERED,
        notes=proof.notes
    )
    db.add(tracking)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_delivery_estimate(db: Session, user_id: int, address_id: int, delivery_type: DeliveryType) -> Dict:
    # In a real application, this would calculate based on distance, traffic, etc.
    # For this example, we'll use simplified logic
    
    now = datetime.now()
    
    if delivery_type == DeliveryType.STANDARD:
        estimated_time = now + timedelta(hours=24)
        delivery_fee = 0
    elif delivery_type == DeliveryType.EXPRESS:
        estimated_time = now + timedelta(hours=4)
        delivery_fee = 50
    else:  # EMERGENCY
        estimated_time = now + timedelta(hours=1)
        delivery_fee = 100
    
    return {
        "estimated_time": estimated_time,
        "delivery_fee": delivery_fee
    } 