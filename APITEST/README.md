# Authentication API with MySQL

This is a complete authentication API built with Express.js and MySQL. It provides endpoints for user registration, login, token refresh, and security auditing.

## Database Schema

```sql
-- Users table - Core user information
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

-- Refresh Tokens table - Manage JWT refresh tokens
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

-- Audit Logs table - Security logging
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

## Setup Instructions

1. Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your MySQL connection details and other settings:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   FRONTEND_URL=http://localhost:5173
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

5. Run tests:
   ```bash
   npm run test
   ```

## API Endpoints

### Authentication
- POST `/auth/register` - Register a new user
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- POST `/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- POST `/auth/refresh-token` - Refresh access token
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

- POST `/auth/logout` - Logout user
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

### User Profile
- GET `/user/profile` - Get user profile
- PUT `/user/profile` - Update user profile

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Security audit logging
- Last login tracking
- CORS protection
- Error handling middleware
- Input validation
- Secure password requirements
- UUID for user and token IDs

## Audit Logging

The API automatically logs the following security events:
- User registration
- Login attempts
- Token refresh
- Logout events

Each audit log entry includes:
- User ID
- Event type
- IP address
- User agent
- Timestamp

## Error Handling

The API returns consistent error responses in the format:
```json
{
  "message": "Error description",
  "status": 400,
  "code": "ERROR_CODE"
}
```

## Testing

The API includes automated tests that verify:
- Health check
- User registration
- Duplicate email prevention
- Login validation
- Invalid credentials handling
- Logout functionality

Run the tests with:
```bash
npm run test
```

## Frontend Integration

To connect your frontend to this API:

1. Update the API base URL in your frontend code:
   ```typescript
   baseURL: 'http://localhost:5000'
   ```

2. Handle token refresh in your API client
3. Store tokens securely (httpOnly cookies recommended)
4. Implement proper error handling