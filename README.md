# dStudio - AI-Powered Survey & Quiz Platform

dStudio is a modern, enterprise-grade web application for creating surveys, quizzes, and assessments. It features AI-powered question generation using Azure OpenAI, beautiful UI/UX, and comprehensive analytics.

![dStudio Platform](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## 🚀 Features

### Core Functionality
- **Multiple Assessment Types**: Create quizzes (with scoring), surveys, polls, and assessments
- **AI-Powered Question Generation**: Generate questions automatically using Azure OpenAI from:
  - Text content
  - File uploads (TXT, PDF, DOC, CSV)
  - Public URLs
- **Manual Question Creation**: Full control with multiple question types:
  - Single choice
  - Multiple choice
  - Text answers
  - Rating scales
  - Yes/No questions
  - Dropdown menus

### User Experience
- **Beautiful Enterprise-Grade UI**: Modern, responsive design with Tailwind CSS
- **Strong Authentication**: JWT-based secure authentication
- **Shareable Links**: Generate unique links for assessments (no login required for respondents)
- **Real-time Scoring**: Automatic scoring for quizzes with instant results
- **Detailed Analytics**: Comprehensive response tracking and statistics

### Technical Features
- **Fully Dockerized**: One command to run everything
- **Background Processing**: Async job processing with Redis and Bull
- **PostgreSQL Database**: Robust data persistence
- **TypeScript**: Full type safety across frontend and backend
- **RESTful API**: Clean, well-documented API architecture

## 📋 Prerequisites

- Docker and Docker Compose installed
- Azure OpenAI API credentials (optional, for AI features)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/dStudio.git
cd dStudio
```

### 2. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
POSTGRES_USER=atlas_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=atlas_db

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_here_change_me

# Azure OpenAI Configuration (required for AI features)
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Application Configuration (defaults work fine)
NODE_ENV=production
BACKEND_PORT=5000
FRONTEND_PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Application

Run this single command to build and start all services:

```bash
docker-compose up --build
```

This will:
- Build the frontend and backend Docker images
- Start PostgreSQL database
- Start Redis for background jobs
- Initialize the database schema
- Start the backend API server
- Start the background worker
- Start the frontend web server

### 4. Access the Application

Once all services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📖 Usage Guide

### Creating Your First Assessment

1. **Register an Account**
   - Navigate to http://localhost:3000
   - Click "Get Started" or "Register"
   - Fill in your details and create an account

2. **Create an Assessment**
   - Go to Dashboard
   - Click "Create Assessment"
   - Enter title, description, and select type (Quiz/Survey/Poll)
   - Save the assessment

3. **Add Questions**

   **Option A - Manual Entry:**
   - Click "Add Question" button
   - Edit the question text and options
   - Set correct answers (for quizzes)
   - Repeat for all questions

   **Option B - AI Generation from Text:**
   - Click "From Text (AI)" tab
   - Paste your content
   - Select number of questions
   - Click "Generate Questions"

   **Option C - AI Generation from File:**
   - Click "From File (AI)" tab
   - Upload your file (TXT, PDF, DOC, CSV)
   - Select number of questions
   - Click "Generate Questions"

   **Option D - AI Generation from URL:**
   - Click "From URL (AI)" tab
   - Enter the public URL
   - Select number of questions
   - Click "Generate Questions"

4. **Publish and Share**
   - Click "Publish" to make your assessment live
   - Click "Copy Share Link" to get the shareable URL
   - Share the link with your respondents

### Taking an Assessment

1. Open the shared link (no login required)
2. Optionally enter your name and email
3. Answer all questions
4. Submit your response
5. View your score (for quizzes)

### Viewing Responses

1. Go to your assessment list
2. Click "Responses" button
3. View analytics and individual responses
4. Click on any response to see detailed answers

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Toastify for notifications

**Backend:**
- Node.js with Express
- TypeScript
- PostgreSQL for database
- Redis for job queue
- Bull for background processing
- JWT for authentication
- Azure OpenAI for AI features

**Infrastructure:**
- Docker & Docker Compose
- Nginx for frontend serving

### Project Structure

```
dStudio/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and Redis configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth and error handling
│   │   ├── services/       # Business logic (OpenAI integration)
│   │   ├── workers/        # Background job processors
│   │   └── types/          # TypeScript type definitions
│   ├── Dockerfile
│   ├── package.json
│   └── init.sql           # Database schema
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database:**
```bash
docker-compose up postgres redis
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| POSTGRES_USER | PostgreSQL username | Yes |
| POSTGRES_PASSWORD | PostgreSQL password | Yes |
| POSTGRES_DB | Database name | Yes |
| JWT_SECRET | Secret for JWT tokens | Yes |
| AZURE_OPENAI_API_KEY | Azure OpenAI API key | No* |
| AZURE_OPENAI_ENDPOINT | Azure OpenAI endpoint | No* |
| AZURE_OPENAI_DEPLOYMENT_NAME | Model deployment name | No* |
| NODE_ENV | Environment (development/production) | No |
| BACKEND_PORT | Backend server port | No |
| FRONTEND_PORT | Frontend server port | No |

*Required only if using AI-powered question generation features

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Reset everything (including database)
docker-compose down -v
```

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts with authentication
- **assessments**: Quiz/survey definitions
- **questions**: Individual questions with types and options
- **responses**: User submissions with answers and scores
- **share_links**: Shareable tokens for assessments
- **jobs**: Background job tracking

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- SQL injection prevention
- CORS configuration
- Input validation
- Secure environment variables

## 🎨 API Documentation

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile (authenticated)
```

### Assessment Endpoints

```
POST   /api/assessments (authenticated)
GET    /api/assessments (authenticated)
GET    /api/assessments/:id (authenticated)
PUT    /api/assessments/:id (authenticated)
DELETE /api/assessments/:id (authenticated)
POST   /api/assessments/:id/publish (authenticated)
POST   /api/assessments/:id/share (authenticated)
GET    /api/assessments/:id/responses (authenticated)
```

### Question Endpoints

```
POST /api/assessments/:assessmentId/questions (authenticated)
POST /api/assessments/:assessmentId/generate-from-text (authenticated)
POST /api/assessments/:assessmentId/generate-from-file (authenticated)
POST /api/assessments/:assessmentId/generate-from-url (authenticated)
PUT  /api/assessments/questions/:id (authenticated)
DELETE /api/assessments/questions/:id (authenticated)
```

### Public Response Endpoints

```
GET  /api/responses/public/:token
POST /api/responses/public/:token/submit
```

## 🐛 Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Change ports in .env file
BACKEND_PORT=5001
FRONTEND_PORT=3001
```

### Database Connection Issues

```bash
# Reset the database
docker-compose down -v
docker-compose up --build
```

### AI Features Not Working

1. Verify Azure OpenAI credentials in `.env`
2. Check that the deployment name is correct
3. Ensure your Azure OpenAI resource is active
4. Check worker logs: `docker-compose logs -f worker`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, Node.js, PostgreSQL, and Azure OpenAI
