import express from 'express';
import multer from 'multer';
import awsS3 from '../services/awsS3.js';
import auth from '../middleware/auth.js';

const router = express.Router();

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

// Upload multiple images
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

    const uploadPromises = req.files.map(file => awsS3.uploadImage(file));
    const results = await Promise.all(uploadPromises);

    // Check if any uploads failed
    const failedUploads = results.filter(result => !result.success);
    if (failedUploads.length > 0) {
      // If any upload failed, clean up successful uploads
      const successfulUploads = results.filter(result => result.success);
      await Promise.all(
        successfulUploads.map(upload => awsS3.deleteImage(upload.key))
      );

      return res.status(500).json({
        success: false,
        message: 'Failed to upload some images',
        errors: failedUploads.map(f => f.error)
      });
    }

    // All uploads successful
    return res.json({
      success: true,
      images: results.map(result => ({
        url: result.url,
        key: result.key
      }))
    });

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