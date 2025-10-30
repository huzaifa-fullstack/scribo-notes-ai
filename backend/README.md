# 📝 Scribo Notes - Backend API

REST API backend for Scribo Notes application built with Node.js, Express, and MongoDB.

## 🚀 Features

- ✅ User Authentication (JWT + Google OAuth)
- ✅ Notes CRUD Operations
- ✅ User Profile Management
- ✅ Avatar Upload with Cloudinary
- ✅ Password Change
- ✅ Note Statistics
- ✅ Search & Filtering
- ✅ Pin/Archive Notes
- ✅ Rate Limiting
- ✅ Error Handling
- ✅ Request Logging

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT, Passport.js (Google OAuth)
- **Image Storage**: Cloudinary
- **Logging**: Pino
- **Testing**: Mocha, Chai, Supertest

## 📦 Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
```

## ⚙️ Environment Variables

Required variables in `.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=your-mongodb-atlas-connection-string

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d

# Frontend
CLIENT_URL=http://localhost:5173

# Cloudinary (for avatars)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

## 🔧 Setup Guides

- **MongoDB Atlas**: See main README
- **Cloudinary**: See `docs/CLOUDINARY_SETUP.md`
- **Google OAuth**: Configure in Google Cloud Console

## 🏃 Running the Application

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Run tests
npm test

# Test specific file
npm test -- tests/profile.test.js

# Test database connection
npm run test:connection

# Initialize database
npm run init-db
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Profile

- `GET /api/profile` - Get user profile with stats
- `PUT /api/profile` - Update profile (name, avatar)
- `PUT /api/profile/password` - Change password
- `POST /api/profile/avatar` - Upload avatar (Cloudinary)
- `DELETE /api/profile/avatar` - Delete avatar
- `GET /api/profile/stats` - Get detailed statistics

### Notes

- `GET /api/notes` - Get all notes (with filters)
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PUT /api/notes/:id/pin` - Pin/Unpin note
- `PUT /api/notes/:id/archive` - Archive/Unarchive note
- `GET /api/notes/stats` - Get notes statistics

### Export

- `POST /api/export/pdf` - Export note as PDF
- `POST /api/export/markdown` - Export note as Markdown

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/profile.test.js
```

Test coverage:

- ✅ Authentication
- ✅ Profile Management
- ✅ Notes CRUD
- ✅ Authorization
- ✅ Input Validation
- ✅ Error Handling

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # MongoDB connection
│   │   ├── passport.js   # Google OAuth
│   │   ├── cloudinary.js # Image upload
│   │   └── logger.js     # Pino logger
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── notesController.js
│   │   └── profileController.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   └── Note.js
│   ├── routes/           # Express routes
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── profile.js
│   │   └── export.js
│   └── services/         # Business logic
│       └── exportService.js
├── scripts/              # Utility scripts
│   ├── init-db.js        # DB initialization
│   └── test-connection.js # Connection test
├── tests/                # Test files
├── docs/                 # Documentation
├── server.js             # Entry point
├── package.json
└── .env.example
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ MongoDB injection prevention

## 📊 Logging

All requests and errors are logged using Pino:

```javascript
[2025-10-28 20:00:00.000 +0500] INFO: User logged in: user@example.com
[2025-10-28 20:00:01.000 +0500] ERROR: Database error: Connection timeout
```

## 🐛 Error Handling

Centralized error handling with custom error responses:

```json
{
  "success": false,
  "error": "Resource not found"
}
```

## 🚀 Deployment

### Prerequisites

- Node.js 16+
- MongoDB Atlas account
- Cloudinary account

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT_SECRET
4. Configure Cloudinary credentials

### Deploy to Heroku/Render/Railway

```bash
# Push to production
git push heroku main

# Or deploy to Render/Railway via Git
```

## 📝 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Check documentation in `/docs`

---

**Built with ❤️ using Node.js & Express**
