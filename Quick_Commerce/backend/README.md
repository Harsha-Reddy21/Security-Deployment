# Quick Commerce Medicine Delivery API

A FastAPI-based backend for a medicine delivery platform with user authentication, medicine catalog management, prescription handling, and rapid delivery functionality.

## Features

- User authentication and profile management
- Medicine catalog with search and filtering
- Prescription upload and verification
- Shopping cart functionality
- Order management and tracking
- Delivery features including emergency delivery

## Requirements

- Python 3.8+
- PostgreSQL

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Create a PostgreSQL database named `quick_commerce`
6. Update the `.env` file with your database credentials

## Running the Application

```
python run.py
```

The API will be available at http://localhost:8000

API documentation will be available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication & Users
- POST /auth/register - Register new user with medical profile
- POST /auth/login - User login
- GET /auth/me - Get current user profile
- PUT /auth/profile - Update user profile
- POST /auth/verify-phone - Verify phone number for delivery

### Addresses
- GET /addresses - Get user's addresses
- POST /addresses - Add new address
- PUT /addresses/{id} - Update address
- DELETE /addresses/{id} - Delete address

### Medicines
- GET /medicines - Get all medicines
- POST /medicines - Add new medicine (pharmacy admin only)
- PUT /medicines/{id} - Update medicine (pharmacy admin only)
- DELETE /medicines/{id} - Remove medicine (pharmacy admin only)
- GET /medicines/search - Search medicines
- GET /medicines/{id}/alternatives - Get alternative medicines
- PATCH /medicines/{id}/stock - Update medicine stock

### Categories
- GET /categories - Get all categories
- POST /categories - Create new category (pharmacy admin only)
- PUT /categories/{id} - Update category (pharmacy admin only)
- DELETE /categories/{id} - Delete category (pharmacy admin only)

### Prescriptions
- POST /prescriptions/upload - Upload prescription
- GET /prescriptions - Get user's prescriptions
- GET /prescriptions/{id} - Get prescription details
- PUT /prescriptions/{id}/verify - Verify prescription (pharmacist only)
- GET /prescriptions/{id}/medicines - Get medicines from prescription

### Shopping Cart
- GET /cart - Get user's cart
- POST /cart/items - Add medicine to cart
- PUT /cart/items/{id} - Update cart item quantity
- DELETE /cart/items/{id} - Remove medicine from cart
- DELETE /cart - Clear entire cart
- POST /cart/validate-prescriptions - Validate prescriptions in cart

### Orders & Delivery
- POST /orders - Create order
- GET /orders - Get user's orders
- GET /orders/{id} - Get order details
- PATCH /orders/{id}/status - Update order status
- GET /orders/{id}/track - Track order
- POST /orders/{id}/delivery-proof - Upload delivery confirmation

### Delivery
- GET /delivery/estimate - Get delivery time estimate
- POST /delivery/emergency - Create emergency delivery request

### Other
- GET /nearby-pharmacies - Find nearby pharmacies 