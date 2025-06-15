# Image Upload Issues Fix

## 🚨 Issues Identified

1. **Cross-Origin-Opener-Policy errors** - Google OAuth popup issues
2. **Image upload failing with 500 error** - AWS S3 configuration issues
3. **Port mismatch** - Frontend connecting to wrong port
4. **Missing authentication headers** - Image upload needs auth token

## ✅ Fixes Applied

### 1. **Port Configuration Fixed**
- Updated `frontend/.env` to use port 5002
- Created centralized API configuration in `frontend/src/config/api.js`
- Updated all components to use API_ENDPOINTS

### 2. **Authentication Headers Added**
- Added Bearer token to image upload requests
- Added proper error handling with detailed error messages
- Fixed authentication for issue creation

### 3. **AWS S3 Configuration**
- ✅ AWS credentials are properly configured
- ✅ AWS S3 service is working
- ✅ Test endpoint confirms configuration is correct

### 4. **API Endpoints Centralized**
All API calls now use the centralized configuration:
```javascript
// Before
fetch('http://localhost:5001/api/issues')

// After  
fetch(API_ENDPOINTS.ISSUES.LIST)
```

## 🔧 Remaining Issues to Fix

### **AWS S3 Bucket Setup**

The AWS configuration is correct, but you need to:

1. **Create the S3 Bucket** (if it doesn't exist):
   ```bash
   # Using AWS CLI
   aws s3 mb s3://voice-image-bucket --region us-east-1
   ```

2. **Set Bucket Permissions** for public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::voice-image-bucket/*"
       }
     ]
   }
   ```

3. **Configure CORS** for the bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### **Cross-Origin-Opener-Policy Fix**

Add these headers to your backend server:

```javascript
// In backend/server.js
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
```

## 🚀 Quick Fix for Testing

If you want to test image upload without setting up AWS S3, you can temporarily use a local file storage solution:

### **Option 1: Use Multer with Local Storage**

```javascript
// In backend/routes/imageRoutes.js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload-local', auth, upload.array('images', 3), (req, res) => {
  try {
    const images = req.files.map(file => ({
      url: `http://localhost:5002/uploads/${file.filename}`,
      key: file.filename
    }));

    res.json({
      success: true,
      images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### **Option 2: Use Cloudinary (Recommended for testing)**

1. **Install Cloudinary**:
   ```bash
   npm install cloudinary
   ```

2. **Update .env** with Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Create Cloudinary service**:
   ```javascript
   // backend/services/cloudinary.js
   import { v2 as cloudinary } from 'cloudinary';

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });

   export const uploadToCloudinary = async (buffer, filename) => {
     return new Promise((resolve, reject) => {
       cloudinary.uploader.upload_stream(
         { resource_type: 'auto', public_id: filename },
         (error, result) => {
           if (error) reject(error);
           else resolve(result);
         }
       ).end(buffer);
     });
   };
   ```

## 📋 Testing Steps

### **1. Test AWS Configuration**
```bash
node test-aws.js
```
Should return:
```json
{
  "success": true,
  "awsConfigured": true,
  "bucket": "voice-image-bucket",
  "region": "us-east-1",
  "hasAccessKey": true,
  "hasSecretKey": true
}
```

### **2. Test Image Upload**
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Login to the application
4. Go to "Report Issue" page
5. Try uploading an image

### **3. Check Backend Logs**
Look for these logs in the backend console:
```
Attempting to upload file to AWS S3: {
  bucket: 'voice-image-bucket',
  key: 'voice-issues/[filename]',
  contentType: 'image/jpeg',
  bufferSize: [size]
}
```

## 🔍 Debugging Steps

### **If Image Upload Still Fails:**

1. **Check AWS Credentials**:
   ```bash
   aws configure list
   ```

2. **Test S3 Access**:
   ```bash
   aws s3 ls s3://voice-image-bucket
   ```

3. **Check Bucket Permissions**:
   ```bash
   aws s3api get-bucket-policy --bucket voice-image-bucket
   ```

4. **Check Backend Logs** for specific error messages

### **Common Error Solutions:**

1. **"Bucket does not exist"**:
   - Create the bucket: `aws s3 mb s3://voice-image-bucket`

2. **"Access Denied"**:
   - Check IAM user permissions
   - Ensure bucket policy allows public read

3. **"Invalid credentials"**:
   - Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   - Check if credentials are expired

## ✅ Final Verification

After fixing the S3 bucket setup:

1. ✅ Image upload should work without 500 errors
2. ✅ Images should be publicly accessible via S3 URLs
3. ✅ Issue creation with images should work
4. ✅ Google OAuth should work without COOP errors

---

**Next Steps**: Set up the S3 bucket with proper permissions, then test the image upload functionality.
