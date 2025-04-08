# Presentation Coach - AI-Powered Business Presentation Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.7-3ECF8E?logo=supabase&logoColor=white)](https://supabase.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai&logoColor=white)](https://openai.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

A comprehensive platform that helps business owners create, practice, and perfect their business presentations using AI-generated scripts and advanced recording capabilities.

<div align="center">
  <img src="src/logo.jpeg" alt="Presentation Coach Logo" width="150" height="150" style="border-radius: 20px;">
</div>

## ✨ Core Features

### 🏢 Business Profile Management
- Detailed business questionnaire
- Industry-specific profiling
- Target audience analysis
- Business goals and objectives tracking
- Company background storage

### 🤖 AI Script Generation
- 60-second script generation using OpenAI GPT-4
- Context-aware content creation
- Industry-specific terminology
- Customizable tone and style
- Script version history and management
- Multiple script storage and retrieval

### 🎥 Professional Recording Studio
- Built-in teleprompter
- HD video recording
- Auto-scrolling script
- Word highlighting
- Recording pause/resume
- Multiple take management
- Video preview and download

### 🔐 User Authentication & Security
- Secure authentication via Supabase Auth
- Email/password authentication
- User profile management
- Session handling
- Row Level Security (RLS)
- Audit logging

## 🛠️ Technical Stack

### Frontend
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.1.1-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?logo=tailwind-css&logoColor=white)
![Framer](https://img.shields.io/badge/Framer_Motion-Latest-black?logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4.5.2-brown?logo=react&logoColor=white)

### Backend & Database
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-Latest-333333?logo=webrtc&logoColor=white)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
- Supabase account ![Supabase](https://img.shields.io/badge/Supabase-Account-3ECF8E?logo=supabase&logoColor=white)
- OpenAI API key ![OpenAI](https://img.shields.io/badge/OpenAI-API_Key-412991?logo=openai&logoColor=white)
- npm or yarn ![npm](https://img.shields.io/badge/npm-Latest-CB3837?logo=npm&logoColor=white)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 Database Schema

<details>
<summary>Click to expand database schema</summary>

### Questionnaires Table
```sql
CREATE TABLE questionnaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    responses JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Scripts Table
```sql
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    title TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
```

### Script Responses Table
```sql
CREATE TABLE script_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    responses JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT script_responses_user_id_key UNIQUE (user_id)
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
</details>

## 🔌 API Endpoints

<details>
<summary>Click to expand API endpoints</summary>

### Authentication (Supabase Auth)
- POST `/auth/v1/signup` - Register new user
- POST `/auth/v1/token?grant_type=password` - User login
- POST `/auth/v1/logout` - User logout

### Edge Functions
- POST `/functions/v1/questionnaire` - Save questionnaire responses
- GET `/functions/v1/questionnaire` - Get user's questionnaire
- POST `/functions/v1/script` - Generate AI script
- GET `/functions/v1/scripts` - Get user's scripts
- DELETE `/functions/v1/scripts/{id}` - Delete a script
</details>

## 🛡️ Security Measures

### Authentication & Authorization
![Supabase Auth](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white)
- Row Level Security (RLS)
- Session management
- Access control
- User-specific data isolation

### Data Protection
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RLS-336791?logo=postgresql&logoColor=white)
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Data encryption at rest

## 🔍 Error Handling

```json
{
  "message": "Error description",
  "status": 400,
  "code": "ERROR_CODE"
}
```

Common error codes:
- `USER_EXISTS` ![Status](https://img.shields.io/badge/409-Email_Exists-red)
- `INVALID_CREDENTIALS` ![Status](https://img.shields.io/badge/401-Invalid_Auth-red)
- `UNAUTHORIZED` ![Status](https://img.shields.io/badge/401-Auth_Required-red)
- `NOT_FOUND` ![Status](https://img.shields.io/badge/404-Not_Found-red)
- `INTERNAL_ERROR` ![Status](https://img.shields.io/badge/500-Server_Error-red)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue if needed

## 🙏 Acknowledgments

- OpenAI for GPT-4 API ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai&logoColor=white)
- Supabase team for BaaS platform ![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase&logoColor=white)
- React team for React 18 ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
- Tailwind CSS team ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)
- All contributors and users ❤️