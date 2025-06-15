import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class AWSS3Service {
  constructor() {
    // AWS S3 Configuration
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });

    this.bucket = process.env.AWS_S3_BUCKET_NAME;
  }

  generateFileName(originalname) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHash('md5').update(`${timestamp}-${randomString}-${originalname}`).digest('hex');
    const ext = originalname.split('.').pop();
    return `${hash}.${ext}`;
  }

  async uploadImage(file) {
    try {
      if (!file || !file.buffer) {
        throw new Error('Invalid file provided');
      }

      if (!this.bucket) {
        throw new Error('AWS S3 bucket name not configured');
      }

      const fileName = this.generateFileName(file.originalname);
      const key = `voice-issues/${fileName}`;

      console.log('Attempting to upload file to AWS S3:', {
        bucket: this.bucket,
        key,
        contentType: file.mimetype,
        bufferSize: file.buffer.length
      });

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make the object publicly readable
        Metadata: {
          'uploaded-by': 'voice-platform',
          'upload-date': new Date().toISOString()
        }
      });

      await this.client.send(command);

      // Construct public URL for AWS S3
      const publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      console.log('Upload successful, public URL:', publicUrl);

      return {
        success: true,
        url: publicUrl,
        key: key,
        bucket: this.bucket
      };
    } catch (error) {
      console.error('Error uploading to AWS S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteImage(key) {
    try {
      if (!key) {
        throw new Error('No key provided for deletion');
      }

      if (!this.bucket) {
        throw new Error('AWS S3 bucket name not configured');
      }

      console.log('Attempting to delete file from AWS S3:', {
        bucket: this.bucket,
        key
      });

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.client.send(command);
      console.log('File deleted successfully from AWS S3');
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting from AWS S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper method to check if AWS credentials are configured
  isConfigured() {
    return !!(process.env.AWS_ACCESS_KEY_ID && 
              process.env.AWS_SECRET_ACCESS_KEY && 
              process.env.AWS_S3_BUCKET_NAME);
  }
}

export default new AWSS3Service();
