import re
from html import escape

def sanitize_string(value: str) -> str:
    """
    Sanitize a string input by removing dangerous characters
    and escaping HTML entities
    """
    if not value:
        return ""
    
    # Trim whitespace
    value = value.strip()
    
    # Escape HTML entities
    value = escape(value)
    
    return value

def validate_username(username: str) -> bool:
    """
    Validate username format:
    - Only alphanumeric characters and underscores
    - Between 3 and 20 characters
    """
    if not username:
        return False
    
    pattern = r'^[a-zA-Z0-9_]{3,20}$'
    return bool(re.match(pattern, username))

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength:
    - At least 8 characters
    - Contains uppercase letter
    - Contains lowercase letter
    - Contains number
    
    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain an uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain a lowercase letter"
    
    if not re.search(r'[0-9]', password):
        return False, "Password must contain a number"
    
    return True, ""

def validate_email(email: str) -> bool:
    """
    Validate email format using a simple regex pattern
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email)) 