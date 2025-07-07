from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from .routers import auth, address, medicine, prescription, cart, order
from .core.database import engine, Base
from .models import user, medicine as medicine_models, prescription as prescription_models, order as order_models

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create uploads directory
os.makedirs(os.getenv("UPLOAD_FOLDER", "./uploads"), exist_ok=True)
os.makedirs(os.path.join(os.getenv("UPLOAD_FOLDER", "./uploads"), "medicines"), exist_ok=True)
os.makedirs(os.path.join(os.getenv("UPLOAD_FOLDER", "./uploads"), "prescriptions"), exist_ok=True)
os.makedirs(os.path.join(os.getenv("UPLOAD_FOLDER", "./uploads"), "delivery_proofs"), exist_ok=True)

app = FastAPI(
    title="Quick Commerce Medicine Delivery API",
    description="API for a medicine delivery platform with user authentication, medicine catalog, prescription handling, and delivery functionality",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/uploads", StaticFiles(directory=os.getenv("UPLOAD_FOLDER", "./uploads")), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(address.router)
app.include_router(medicine.router)
app.include_router(medicine.category_router)
app.include_router(prescription.router)
app.include_router(cart.router)
app.include_router(order.router)
app.include_router(order.delivery_router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Quick Commerce Medicine Delivery API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/nearby-pharmacies")
async def get_nearby_pharmacies(latitude: float, longitude: float, radius: float = 5.0):
    # In a real application, this would query a database with geospatial capabilities
    # For this example, we'll return mock data
    return [
        {
            "id": 1,
            "name": "QuickMed Pharmacy",
            "address": "123 Health Street",
            "distance": 1.2,
            "has_delivery": True
        },
        {
            "id": 2,
            "name": "MediExpress",
            "address": "456 Wellness Avenue",
            "distance": 2.5,
            "has_delivery": True
        },
        {
            "id": 3,
            "name": "CarePharm",
            "address": "789 Recovery Road",
            "distance": 3.8,
            "has_delivery": False
        }
    ] 