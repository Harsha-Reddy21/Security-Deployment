# API Security & Validation Project

A secure API implementation with FastAPI backend and React frontend, featuring comprehensive security measures and validation.

## Project Structure

- `/backend` - FastAPI backend with security features
- `/frontend` - React frontend application

## Backend Features

### Authentication Endpoints
- `POST /auth/login` - Login and get JWT token
- `POST /auth/register` - Register new user
- `POST /auth/refresh` - Refresh JWT token (rate limited)
- `POST /auth/logout` - Logout user (invalidate token)
- `POST /auth/forgot-password` - Password reset request
- `GET /health` - Health check endpoint

### Security Implementations
- **Input Sanitization**: Clean and validate all user inputs
- **CORS Configuration**: Set up proper cross-origin policies
- **Rate Limiting**: Implement rate limits on sensitive endpoints
- **Security Headers**: Add HTTPS, HSTS, and other security headers
- **Error Handling**: Custom exception handlers with proper HTTP codes

### Rate Limiting Rules
- Login attempts: 5 per minute per IP
- Registration: 3 per minute per IP
- Password reset: 1 per minute per IP
- General API: 100 per minute per IP

## Frontend Features
- Secure authentication flow
- Form validation
- Protected routes
- Token refresh mechanism
- User profile management

## Setup Instructions

### Backend
```bash
cd backend
pip install -r requirements.txt
cd app
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Security Best Practices Implemented

1. **JWT Authentication**
   - Short-lived access tokens
   - Refresh token mechanism
   - Token blacklisting for logout

2. **Input Validation**
   - Data validation with Pydantic
   - Input sanitization
   - Strong password requirements

3. **Rate Limiting**
   - Tiered rate limits based on endpoint sensitivity
   - IP-based rate limiting

4. **Security Headers**
   - HSTS headers
   - XSS protection
   - Content Security Policy
   - X-Frame-Options

5. **Error Handling**
   - Custom exception handlers
   - Proper HTTP status codes
   - Non-revealing error messages 