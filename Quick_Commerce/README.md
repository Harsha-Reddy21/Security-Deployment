# Quick Commerce Medicine Delivery Application

A complete, quick commerce medicine delivery platform with user authentication, medicine catalog management, prescription handling, and rapid delivery functionality.

## Project Overview

This project consists of:

1. **Backend API**: A FastAPI-based RESTful API that handles all business logic
2. **Frontend**: A React-based user interface for customers to browse medicines, upload prescriptions, and place orders

## Features

- User authentication and profile management
- Medicine catalog with search and filtering
- Prescription upload and verification
- Shopping cart functionality
- Order management and tracking
- Delivery features including emergency delivery
- Admin panel for pharmacy management

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- JWT Authentication
- Pydantic for data validation

### Frontend
- React 18
- React Router v6
- React Bootstrap
- Formik & Yup
- Axios

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

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

7. Run the application:
   ```
   python run.py
   ```

The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The frontend will be available at http://localhost:3000

## API Documentation

API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
quick_commerce/
├── backend/
│   ├── app/
│   │   ├── core/       # Core modules (database, security)
│   │   ├── crud/       # CRUD operations
│   │   ├── models/     # SQLAlchemy models
│   │   ├── routers/    # API routes
│   │   ├── schemas/    # Pydantic schemas
│   │   └── utils/      # Utility functions
│   ├── .env            # Environment variables
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── context/    # React context providers
    │   ├── pages/      # Page components
    │   └── services/   # API services
    └── package.json
```

## License

This project is licensed under the MIT License. 