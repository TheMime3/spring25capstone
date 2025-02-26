# Full-Stack Authentication System

A production-ready authentication system with a React frontend and Express.js backend, featuring comprehensive security measures and user management.

## Features

### Frontend (React + TypeScript)
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 Secure authentication flow
- 🔄 Automatic token refresh
- 📱 Mobile-friendly design
- ⚡ Fast page transitions with Framer Motion
- 🛣️ Protected routes
- 🎯 Type safety with TypeScript
- 🔍 Form validation
- ⚠️ Error handling
- 🔄 Loading states
- 📤 Logout functionality

### Backend (Express.js + MySQL)
- 🔐 JWT-based authentication
- 🔄 Refresh token rotation
- 🔒 Password hashing with bcrypt
- 📝 User registration and login
- 🛡️ CORS protection
- 📊 Security audit logging
- 🔍 Input validation
- ⚠️ Error handling middleware
- 🗄️ MySQL database with optimized schema
- 🆔 UUID for secure IDs

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Zustand (State Management)
- Axios
- Lucide React (Icons)

### Backend
- Express.js
- MySQL
- JSON Web Tokens (JWT)
- bcrypt
- CORS
- UUID

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Backend Setup

1. Navigate to the API directory:
   ```bash
   cd APITEST
   ```

2. Create and configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your MySQL credentials and other settings:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=auth_api_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   FRONTEND_URL=*
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up the database:
   ```bash
   npm run setup
   ```

6. Start the API server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Local Network Demo

This application is configured to be easily shared on your local network for demonstration purposes.

### Running the Demo

1. Make sure your MySQL database is set up and running.

2. Start both the frontend and backend servers with a single command:
   ```bash
   npm run start-demo
   ```

3. The script will display URLs that can be used to access the application:
   - Local access: http://localhost:5173
   - Network access: http://YOUR_IP_ADDRESS:5173

4. Share the network access URL with people on your local network.

5. They can access the login page, create accounts, and use the application from their devices.

### How It Works

- The frontend automatically detects the correct API URL based on how it's being accessed
- The backend accepts requests from any origin on your local network
- Both servers bind to all network interfaces, making them accessible from other devices
- The start script displays all available IP addresses that can be used to access the application

### Security Note

The local network demo configuration is intended for demonstration purposes only. For production deployment:

- Restrict CORS to specific origins
- Use proper SSL/TLS certificates
- Set strong JWT secrets
- Configure proper database security

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email)
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_tokens (user_id)
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    event_type ENUM('login', 'logout', 'register', 'password_change', 'token_refresh') NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_audit (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

#### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
    "refreshToken": "your-refresh-token"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
    "refreshToken": "your-refresh-token"
}
```

### User Management

#### Get User Profile
```http
GET /user/profile
Authorization: Bearer your-access-token
```

## Security Features

### JWT Token Management
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh token rotation on every use
- Secure token storage in httpOnly cookies

### Password Security
- Passwords hashed using bcrypt
- Minimum password length enforcement
- Password strength validation

### Audit Logging
- Login attempts
- Registration events
- Token refreshes
- Logout events
- IP address tracking
- User agent logging

### API Security
- CORS protection
- Rate limiting
- Input validation
- Error handling
- SQL injection prevention
- XSS protection

## Frontend Features

### Authentication Flow
- Protected routes using React Router
- Automatic token refresh
- Session persistence
- Secure token storage

### User Interface
- Responsive design
- Loading states
- Error messages
- Form validation
- Smooth transitions
- Mobile-friendly

### State Management
- Centralized auth state with Zustand
- Type-safe state updates
- Persistent auth state

## Testing

Run the automated test suite:
```bash
npm run test
```

The tests cover:
- API health check
- User registration
- Login validation
- Token refresh
- Logout functionality
- Error cases

## Error Handling

The API returns consistent error responses:
```json
{
  "message": "Error description",
  "status": 400,
  "code": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Authentication required
- `INVALID_CREDENTIALS`: Wrong email or password
- `TOKEN_EXPIRED`: JWT token has expired
- `INVALID_TOKEN`: Invalid or malformed token

## Production Deployment

### Backend
1. Update environment variables for production
2. Set secure JWT secrets
3. Configure proper CORS settings
4. Enable rate limiting
5. Set up SSL/TLS
6. Configure database connection pool

### Frontend
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Configure production API URL
3. Enable production error logging
4. Optimize bundle size
5. Configure CDN (if used)

## Troubleshooting

### Common Issues

#### API Connection Problems
- Ensure the backend server is running
- Check that the API URL is correctly configured
- Verify that CORS is properly set up
- Check network connectivity between devices

#### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure the database and tables exist
- Run `npm run setup` to initialize the database

#### Authentication Failures
- Check that JWT secrets are properly set
- Verify token expiration times
- Ensure refresh tokens are being stored correctly
- Check for clock synchronization issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.