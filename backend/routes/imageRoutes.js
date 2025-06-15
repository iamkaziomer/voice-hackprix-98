import express from 'express';
import multer from 'multer';
import awsS3 from '../services/awsS3.js';
// import cloudinaryService from '../services/cloudinaryService.js'; // Uncomment after installing cloudinary
import auth from '../middleware/auth.js';

const router = express.Router();

// Test AWS S3 configuration
router.get('/test-aws', async (req, res) => {
  try {
    const isConfigured = awsS3.isConfigured();

    res.json({
      success: true,
      awsConfigured: isConfigured,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Maximum 3 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
}).array('images', 3);

// Wrap multer middleware to handle errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        success: false,
        message: 'Error uploading files'
      });
    }
    // Everything went fine
    next();
  });
};

// Upload multiple images with local storage fallback
router.post('/upload', auth, uploadMiddleware, async (req, res) => {
  try {
    console.log('Upload request received');

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    console.log(`Processing ${req.files.length} files`);

    // Try AWS S3 first
    try {
      const uploadPromises = req.files.map(file => awsS3.uploadImage(file));
      const results = await Promise.all(uploadPromises);

      // Check if any uploads failed
      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length === 0) {
        console.log('AWS S3 upload successful');
        return res.json({
          success: true,
          images: results.map(result => ({
            url: result.url,
            key: result.key
          })),
          service: 'AWS S3'
        });
      } else {
        throw new Error('AWS S3 upload failed');
      }
    } catch (awsError) {
      console.log('AWS S3 failed, using local storage fallback:', awsError.message);

      // Fallback to local storage
      const images = [];
      const uploadDir = 'uploads';

      // Create uploads directory if it doesn't exist
      const fs = await import('fs');
      const path = await import('path');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const file of req.files) {
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
        const filepath = path.join(uploadDir, filename);

        // Save file to local storage
        fs.writeFileSync(filepath, file.buffer);

        images.push({
          url: `http://localhost:${process.env.PORT || 5002}/uploads/${filename}`,
          key: filename
        });
      }

      console.log('Local storage upload successful');
      return res.json({
        success: true,
        images,
        service: 'Local Storage (fallback)'
      });
    }

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading images'
    });
  }
});

// Delete image
router.delete('/:key', auth, async (req, res) => {
  try {
    const result = await awsS3.deleteImage(req.params.key);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }

    return res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting image'
    });
  }
});

export default router;