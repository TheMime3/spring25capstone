# Presentation Coach - AI-Powered Business Presentation Platform

A comprehensive platform that helps business owners create, practice, and perfect their business presentations using AI-generated scripts and advanced recording capabilities.

## Core Features

### 1. Business Profile Management
- Detailed business questionnaire
- Industry-specific profiling
- Target audience analysis
- Business goals and objectives tracking
- Company background storage

### 2. AI Script Generation
- 60-second script generation using OpenAI GPT-4
- Context-aware content creation
- Industry-specific terminology
- Customizable tone and style
- Script version history

### 3. Professional Recording Studio
- Built-in teleprompter
- HD video recording
- Auto-scrolling script
- Word highlighting
- Recording pause/resume
- Multiple take management

### 4. User Authentication
- Secure email/password authentication
- JWT token management
- Session handling
- Password encryption
- User profile management

## Technical Stack

### Frontend
- React 18.3.1
- TypeScript 5.5.3
- Vite 6.1.1
- Tailwind CSS 3.4.1
- Framer Motion (animations)
- Zustand (state management)
- Axios (API client)
- React Router 6.22.2

### Backend
- Node.js
- Express.js 4.18.3
- MySQL 8+
- JWT Authentication
- OpenAI API Integration
- WebRTC (video recording)

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Refresh token rotation
- Secure session management
- CORS protection
- Input validation
- Error handling middleware

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- OpenAI API key
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Set up the backend:
   ```bash
   cd APITEST
   npm install
   ```

4. Configure environment variables:

   Frontend (.env):
   ```
   PORT=5173
   VITE_API_URL=http://localhost:5000
   ```

   Backend (APITEST/.env):
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=auth_api_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   FRONTEND_URL=*
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   OPENAI_API_KEY=your-openai-api-key
   ```

5. Initialize the database:
   ```bash
   cd APITEST
   npm run setup
   ```

6. Start the development servers:
   ```bash
   # In the root directory
   npm run start-demo
   ```

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

### Questionnaires Table
```sql
CREATE TABLE questionnaires (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    responses JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_questionnaires (user_id)
);
```

## API Endpoints

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- POST `/auth/refresh-token` - Refresh access token
- POST `/auth/logout` - User logout

### User Management
- GET `/user/profile` - Get user profile
- PUT `/user/profile` - Update user profile

### Questionnaire
- POST `/user/questionnaire` - Save questionnaire responses
- GET `/user/questionnaire` - Get user's questionnaire

### Script Generation
- POST `/script/generate` - Generate AI script

## Features in Detail

### Business Profile Questionnaire
- Business information collection
- Industry analysis
- Target audience definition
- Business goals assessment
- Contact information management
- Certification tracking

### Script Generator
- AI-powered content generation
- Context-aware scripting
- Industry-specific terminology
- Customizable messaging
- Version history
- Script library management

### Recording Studio
- Professional teleprompter
- HD video recording
- Auto-scrolling text
- Word highlighting
- Pause/Resume functionality
- Take management
- Video preview
- Download capabilities

### User Dashboard
- Profile management
- Script history
- Recording library
- Business profile overview
- Quick actions
- Progress tracking

## Security Measures

### Authentication
- JWT token-based authentication
- Refresh token rotation
- Secure password hashing
- Session management
- Access control

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Error handling

### Audit Logging
- User activity tracking
- Security event logging
- IP address monitoring
- User agent tracking
- Timestamp recording

## Development

### Running Tests
```bash
cd APITEST
npm run test
```

### Local Network Demo
Run the demo script to start both frontend and backend servers:
```bash
npm run start-demo
```

This will:
- Start the API server on port 5000
- Start the frontend on port 5173
- Display local and network access URLs
- Enable sharing on local network

### Building for Production
```bash
# Build frontend
npm run build

# Prepare backend
cd APITEST
npm run build
```

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
- `INVALID_CREDENTIALS`: Wrong email/password
- `TOKEN_EXPIRED`: JWT token expired
- `INVALID_TOKEN`: Invalid token
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue if needed

## Acknowledgments

- OpenAI for GPT-4 API
- React team for React 18
- Tailwind CSS team
- All contributors and users