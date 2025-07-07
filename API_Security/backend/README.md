# Secure API Backend

A FastAPI backend with comprehensive security features including:

- JWT Authentication
- Input Validation & Sanitization
- Rate Limiting
- CORS Configuration
- Security Headers
- Custom Error Handling

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
cd app
uvicorn main:app --reload
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout (invalidate token)
- `POST /auth/forgot-password` - Password reset request

### User
- `GET /users/me` - Get current user info
- `PUT /users/me/update` - Update user info

### System
- `GET /health` - Health check endpoint

## Security Features

- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Token blacklisting for logout
- Password strength validation
- Secure headers (HSTS, XSS Protection, etc.)
- CORS configuration 