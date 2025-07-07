# Quick Commerce Frontend

A React-based frontend for the Quick Commerce Medicine Delivery Application.

## Features

- User authentication and profile management
- Browse and search medicines by category
- Upload and manage prescriptions
- Shopping cart functionality
- Order placement and tracking
- Responsive design for all devices

## Tech Stack

- React 18
- React Router v6
- React Bootstrap for UI components
- Formik & Yup for form validation
- Axios for API requests
- React Icons

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

The application will be available at http://localhost:3000

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/         # React context providers
├── pages/           # Page components
├── services/        # API services
├── App.js           # Main application component
└── index.js         # Entry point
```

## Connecting to Backend

The frontend is configured to connect to the backend API at `http://localhost:8000`. If your backend is running on a different URL, update the `baseURL` in `src/services/api.js`.

## Authentication

The application uses JWT token-based authentication. The token is stored in localStorage and automatically included in API requests. 