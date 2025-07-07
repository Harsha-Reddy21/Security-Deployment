# User Authentication System

A secure user authentication system with JWT tokens and role-based access control.

## Features

- User registration with password hashing (bcrypt)
- User login with JWT token generation
- Protected routes with token validation
- Role-based access control (user/admin)
- Admin dashboard for user management
- React frontend with responsive design

## Backend API Endpoints

- `POST /auth/register` - User registration with password hashing
- `POST /auth/login` - User login with JWT token generation
- `GET /auth/me` - Get current user info (protected route)
- `GET /users` - Get all users (admin only)
- `PUT /users/{user_id}/role` - Change user role (admin only)
- `DELETE /users/{user_id}` - Delete user (admin only)

## Security Features

- Password hashing with bcrypt
- JWT tokens with expiration (30 minutes)
- Password strength validation
- Role-based access control
- Protection against duplicate usernames and emails

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic, Python-Jose, Passlib
- **Frontend**: React, React Router, Axios
- **Database**: SQLite (for simplicity, can be replaced with PostgreSQL, MySQL, etc.)

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the server:
   ```
   python run.py
   ```
   
The backend API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm start
   ```

The frontend will be available at http://localhost:3000

## Default Admin User

To create an admin user, register a regular user first, then use the following SQL command:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

## License

MIT 