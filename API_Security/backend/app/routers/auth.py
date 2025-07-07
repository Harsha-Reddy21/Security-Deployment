from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
import re
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address

# For demo purposes, we'll use an in-memory database
# In a real app, you would use a proper database
users_db = {}
blacklisted_tokens = set()
password_reset_tokens = {}

# JWT settings
SECRET_KEY = "your-secret-key-should-be-in-env-variables"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Create router
router = APIRouter()

# Get limiter instance
limiter = Limiter(key_func=get_remote_address)

# Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username must be alphanumeric')
        return v
        
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain an uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain a lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain a number')
        return v

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Check if token is blacklisted
    if token in blacklisted_tokens:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = users_db.get(token_data.username)
    if user is None:
        raise credentials_exception
    
    return user

# Endpoints
@router.post("/register")
@limiter.limit("3/minute")
async def register(request: Request, user: UserCreate):
    if user.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Sanitize input
    username = user.username.strip()
    email = user.email.strip().lower()
    
    # Store user with hashed password
    users_db[username] = {
        "username": username,
        "email": email,
        "hashed_password": get_password_hash(user.password)
    }
    
    return {"message": "User registered successfully"}

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user["username"]})
    refresh_token = create_refresh_token(data={"sub": user["username"]})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
@limiter.limit("5/minute")
async def refresh_token(request: Request, token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user exists
        if username not in users_db:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create new tokens
        access_token = create_access_token(data={"sub": username})
        refresh_token = create_refresh_token(data={"sub": username})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    # Add token to blacklist
    blacklisted_tokens.add(token)
    return {"message": "Successfully logged out"}

@router.post("/forgot-password")
@limiter.limit("1/minute")
async def forgot_password(request: Request, reset_request: PasswordResetRequest):
    # Find user by email
    user = None
    for username, user_data in users_db.items():
        if user_data["email"] == reset_request.email:
            user = user_data
            break
    
    if not user:
        # Don't reveal that email doesn't exist for security
        return {"message": "If your email is registered, you will receive a password reset link"}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    password_reset_tokens[reset_token] = {
        "username": user["username"],
        "expires": datetime.utcnow() + timedelta(hours=1)
    }
    
    # In a real app, send email with reset link
    # For demo, just return the token
    return {
        "message": "Password reset link sent",
        "reset_token": reset_token  # In production, this would be sent via email
    } 