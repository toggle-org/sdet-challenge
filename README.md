# SDET Challenge Project

A full-stack application with NestJS backend and React frontend designed for SDET technical interviews. This project demonstrates modern web development practices, clean architecture, and provides a comprehensive testing ground for quality assurance activities.

## 🏗️ Architecture

- **Backend**: NestJS with TypeScript, CQRS pattern, TypeORM, SQLite
- **Frontend**: React with Vite, TypeScript, Tailwind CSS
- **Authentication**: JWT-based authentication
- **Database**: SQLite (development), easily configurable for other databases
- **Dev Environment**: VS Code Dev Container for consistent development experience

## ✨ Features

### Backend API Endpoints

- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/signin` - Sign into an account
- `GET /api/auth/profile` - Get current user profile
- `POST /api/subscriptions` - Create a subscription for the authenticated user
- `GET /api/subscriptions` - Get all subscriptions for the authenticated user

### Frontend Application

- **Sign Up Page**: User registration with form validation
- **Sign In Page**: User authentication
- **Home Page**: Dashboard displaying user information and subscriptions
- **Subscription Management**: Create and view subscriptions
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## 📊 Data Models

### Account Entity

```typescript
{
  id: string (UUID)
  email: string (unique)
  password: string (hashed with bcrypt)
  name: string
  createdAt: Date
  updatedAt: Date
  subscriptions: Subscription[]
}
```

### Subscription Entity

```typescript
{
  id: string(UUID);
  type: "web" | "ios" | "android";
  status: string;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
  account: Account;
}
```

## 🚀 Getting Started

### Method 1: Dev Container (Recommended)

#### Prerequisites

- VS Code with Dev Container extension
- Docker Desktop

#### Setup Steps

1. Clone this repository
2. Open the project in VS Code
3. When prompted, click "Reopen in Container" or use Command Palette: "Dev Containers: Reopen in Container"
4. Wait for the container to build and dependencies to install automatically
5. Open two terminals in VS Code

#### Start the Applications

Terminal 1 (Backend):

```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

### Method 2: Local Development

#### Prerequisites

- Node.js 18+ and npm
- Git

#### Quick Setup

```bash
# Clone the repository
git clone <repository-url>
cd sdet-challenge

# Run the setup script
chmod +x setup.sh
./setup.sh

# Or on Windows
setup.bat
```

#### Manual Setup

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Start backend (Terminal 1)
cd backend
npm run start:dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api (when backend is running)

## 🔧 Development

### Backend Development

- Built with NestJS framework
- Implements CQRS (Command Query Responsibility Segregation) pattern
- Uses TypeORM for database operations
- JWT authentication with Passport
- Input validation with class-validator
- Environment configuration support

### Frontend Development

- React 18 with TypeScript
- Vite for fast development and building
- React Router for client-side routing
- React Hook Form for form management
- Axios for API communication
- Tailwind CSS for styling
- React Hot Toast for notifications

### Database

- SQLite database file: `backend/database.sqlite`
- Automatic schema synchronization in development
- Database file is created automatically on first run

## 🐳 Production Deployment

### Using Docker Compose

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build

# Access the application at http://localhost
```

### Environment Variables

Create `.env` files for production:

**Backend** (`backend/.env`):

```env
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret
PORT=3001
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3001/api
```

## 📁 Project Structure

```
sdet-challenge/
├── .devcontainer/              # Dev container configuration
│   ├── devcontainer.json
│   └── docker-compose.yml
├── backend/                    # NestJS backend application
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   │   ├── commands/      # CQRS commands
│   │   │   ├── handlers/      # Command/query handlers
│   │   │   ├── dto/           # Data transfer objects
│   │   │   ├── entities/      # Database entities
│   │   │   ├── guards/        # Auth guards
│   │   │   └── strategies/    # Passport strategies
│   │   ├── subscription/      # Subscription module
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.prod.yml     # Production deployment
├── setup.sh                   # Setup script (Unix/Linux/macOS)
├── setup.bat                  # Setup script (Windows)
└── README.md
```

## 🧪 Testing

This project is designed for SDET interviews and provides multiple testing opportunities:

### API Testing

- RESTful API endpoints for automation testing
- JWT authentication flow testing
- CRUD operations on subscriptions
- Error handling and validation testing

### Frontend Testing

- User interface automation
- Form validation testing
- Authentication flow testing
- Responsive design testing

### Suggested Test Scenarios

1. **User Registration and Authentication**

   - Valid/invalid email formats
   - Password strength validation
   - Duplicate email handling
   - Login with valid/invalid credentials

2. **Subscription Management**

   - Create subscriptions with different types
   - Validation of required fields
   - Date format validation
   - User isolation (users see only their subscriptions)

3. **Security Testing**
   - JWT token validation
   - Protected route access
   - CORS configuration
   - Input sanitization

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 3001 are available
2. **Node version**: Use Node.js 18 or higher
3. **Dependencies**: Run `npm install` in both backend and frontend directories
4. **Database**: SQLite file is created automatically, no setup required

### Logs

- Backend logs appear in the terminal where `npm run start:dev` is running
- Frontend development logs appear in the browser console

## 🤝 Contributing

This project is designed for educational and interview purposes. Feel free to:

- Add new features
- Implement additional testing scenarios
- Improve the UI/UX
- Add more comprehensive error handling
- Implement additional authentication methods

## 📄 License

MIT License - feel free to use this project for educational and interview purposes.
