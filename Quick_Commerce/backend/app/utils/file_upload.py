import os
import shutil
from fastapi import UploadFile, HTTPException
from uuid import uuid4
from pathlib import Path
import aiofiles
from typing import Optional
from datetime import datetime

UPLOAD_DIR = os.getenv("UPLOAD_FOLDER", "./uploads")

def get_file_path(directory: str) -> str:
    """Create directory if it doesn't exist and return the path"""
    upload_dir = os.path.join(UPLOAD_DIR, directory)
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir

async def save_upload_file(upload_file: UploadFile, directory: str) -> str:
    """Save an upload file to the specified directory and return the filename"""
    if not upload_file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Generate a unique filename
    file_extension = Path(upload_file.filename).suffix
    unique_filename = f"{uuid4().hex}{file_extension}"
    
    # Create full path
    upload_dir = get_file_path(directory)
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save the file
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return the relative path
    return os.path.join(directory, unique_filename)

def validate_image_extension(filename: str) -> bool:
    """Validate that the file has an allowed image extension"""
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
    file_extension = Path(filename).suffix.lower()
    return file_extension in allowed_extensions 