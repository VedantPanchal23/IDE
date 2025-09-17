# Backend - VS Code Studio IDE

Backend API server for the VS Code Studio IDE application.

## 🏗️ Structure

```
backend/
├── 📁 config/          # Configuration files
├── 📁 controllers/     # Route controllers
├── 📁 middleware/      # Express middleware
├── 📁 models/          # Data models
├── 📁 routes/          # API routes
├── 📄 app.js           # Express app configuration
├── 📄 server.cjs       # Main server entry point
├── 📄 server-simple.cjs # Simple server variant
└── 📄 package.json     # Dependencies and scripts
```

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# Server starts on http://localhost:3000
```

### Production
```bash
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### File Management
- `GET /api/files` - List files
- `POST /api/files` - Create file
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file

### Project Management
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🛠️ Technology Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **JSON** - Data interchange format

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key
DB_CONNECTION_STRING=your-database-url
```

## 📦 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🔒 Security

- CORS enabled for cross-origin requests
- Input validation and sanitization
- JWT-based authentication
- Environment variable configuration

## 📝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include unit tests for new features
4. Update documentation as needed

---

Part of the VS Code Studio IDE project
