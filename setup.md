# VOICE Platform Setup Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- AWS S3 account (for image storage)
- Google OAuth credentials

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/voice-platform

# JWT Secret (Generate a strong secret key)
JWT_SECRET=your-super-secret-jwt-key-here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Google OAuth Configuration
GOOGLE_CLIENT_ID=1038311014148-t7i7mm9a9h9cu5i2k3rnhahjolc762d2.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5173

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `frontend/.env`:
```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000/api

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=1038311014148-t7i7mm9a9h9cu5i2k3rnhahjolc762d2.apps.googleusercontent.com

# App Configuration
VITE_APP_NAME=VOICE
VITE_APP_DESCRIPTION=Civic Issue Reporting Platform
```

### 3. AWS S3 Setup

1. Create an S3 bucket in AWS Console
2. Set bucket policy for public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

3. Create IAM user with S3 permissions
4. Add credentials to backend `.env`

### 4. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Update MONGO_URI in `.env`

### 5. Create Admin User (Optional)

```bash
# In MongoDB shell or MongoDB Compass
use voice-platform

db.admins.insertOne({
  name: "Admin User",
  email: "admin@voice.com",
  password: "$2a$10$hashedpassword", // Use bcrypt to hash
  role: "superadmin",
  region: "All",
  permissions: {
    canUpdateStatus: true,
    canDeleteIssues: true,
    canManageUsers: true,
    canViewAnalytics: true
  },
  isActive: true,
  createdAt: new Date()
})
```

### 6. Running the Application

#### Start Backend
```bash
cd backend
npm run dev
# or
npm start
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000 (shows available endpoints)

## 🎯 Features Implemented

### ✅ Authentication
- [x] Email/Password login/signup
- [x] Google OAuth integration
- [x] JWT token-based authentication
- [x] Admin authentication
- [x] Protected routes

### ✅ Issue Management
- [x] Create issues with images
- [x] AWS S3 image storage
- [x] Issue categorization
- [x] Priority levels
- [x] Location-based filtering
- [x] Upvoting system
- [x] Comments system

### ✅ Admin Panel
- [x] Admin dashboard with analytics
- [x] Issue status management
- [x] Region-based access control
- [x] Admin action logging
- [x] Issue deletion/moderation

### ✅ UI/UX
- [x] Modern gradient design
- [x] Responsive layout
- [x] Tailwind CSS styling
- [x] Loading states
- [x] Error handling
- [x] Toast notifications

### ✅ Technical Features
- [x] MongoDB database
- [x] Express.js backend
- [x] React.js frontend
- [x] File upload handling
- [x] Input validation
- [x] Error boundaries
- [x] Security middleware

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues/:id/upvote` - Upvote issue
- `POST /api/issues/:id/remove-upvote` - Remove upvote

### Images
- `POST /api/images/upload` - Upload images
- `DELETE /api/images/:key` - Delete image

### Admin
- `GET /api/admin/dashboard` - Admin analytics
- `GET /api/admin/issues` - Admin issue management
- `PATCH /api/admin/issues/:id/status` - Update issue status
- `DELETE /api/admin/issues/:id` - Delete issue

## 🎨 Design Theme

The application follows the modern gradient design theme from the provided image:
- **Primary Colors**: Teal/Cyan gradients (#667eea to #764ba2)
- **Secondary Colors**: Blue gradients (#4facfe to #00f2fe)
- **Accent Colors**: Pink/Orange gradients (#f093fb to #f5576c)
- **Typography**: Clean, modern fonts with proper hierarchy
- **Components**: Glass morphism effects, subtle shadows, smooth animations
- **Responsive**: Mobile-first design with proper breakpoints

## 🚨 Important Notes

1. **Security**: Change all default passwords and secrets in production
2. **Environment**: Never commit `.env` files to version control
3. **AWS Costs**: Monitor S3 usage to avoid unexpected charges
4. **Database**: Backup MongoDB data regularly
5. **Updates**: Keep dependencies updated for security

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: Check frontend URL in backend CORS config
2. **Image Upload Fails**: Verify AWS credentials and bucket permissions
3. **Google OAuth Fails**: Check client ID and redirect URI
4. **Database Connection**: Verify MongoDB is running and connection string
5. **Port Conflicts**: Change ports in .env if 5000/5173 are occupied

### Debug Commands:
```bash
# Check backend logs
cd backend && npm start

# Check frontend logs
cd frontend && npm run dev

# Test API endpoints
curl http://localhost:5000/api/auth/me

# Check MongoDB connection
mongosh "your-connection-string"
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Verify environment variables
4. Test API endpoints individually

---

**🎉 Your VOICE platform is now ready to empower communities and drive positive change!**
