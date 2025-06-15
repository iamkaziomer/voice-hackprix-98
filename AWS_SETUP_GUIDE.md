# AWS S3 Setup Guide for VOICE Platform

## 🚀 Complete AWS S3 Configuration

### Prerequisites
- AWS Account
- AWS CLI (optional but recommended)
- Basic understanding of AWS IAM

### 1. Create AWS S3 Bucket

1. **Login to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Navigate to S3 service

2. **Create New Bucket**
   - Click "Create bucket"
   - Choose a unique bucket name (e.g., `voice-platform-images-[your-name]`)
   - Select region (recommend `us-east-1`)
   - **Important**: Uncheck "Block all public access" for public image access
   - Enable versioning (optional but recommended)
   - Click "Create bucket"

3. **Configure Bucket Policy for Public Read**
   - Go to your bucket → Permissions → Bucket Policy
   - Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

### 2. Create IAM User for Programmatic Access

1. **Navigate to IAM**
   - Go to IAM service in AWS Console
   - Click "Users" → "Add users"

2. **Create User**
   - Username: `voice-platform-s3-user`
   - Access type: "Programmatic access"
   - Click "Next: Permissions"

3. **Attach Policies**
   - Click "Attach existing policies directly"
   - Search and select: `AmazonS3FullAccess`
   - Or create custom policy for better security (see below)
   - Click "Next" → "Create user"

4. **Save Credentials**
   - **IMPORTANT**: Copy and save:
     - Access Key ID
     - Secret Access Key
   - You won't be able to see the secret key again!

### 3. Custom IAM Policy (Recommended for Production)

For better security, create a custom policy instead of `AmazonS3FullAccess`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
        }
    ]
}
```

### 4. Update Your .env File

Replace the placeholder values in `backend/.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-actual-access-key-id
AWS_SECRET_ACCESS_KEY=your-actual-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-actual-bucket-name
```

### 5. Test Configuration

1. **Start your backend server**:
```bash
cd backend
npm start
```

2. **Test image upload** through your frontend application

3. **Check AWS S3 Console** to verify images are being uploaded to the `voice-issues/` folder

### 6. Security Best Practices

1. **Never commit .env files** to version control
2. **Use IAM roles** in production instead of access keys when possible
3. **Enable CloudTrail** for audit logging
4. **Set up bucket notifications** for monitoring
5. **Configure CORS** if needed for direct frontend uploads

### 7. Cost Optimization

1. **Set up lifecycle policies** to automatically delete old images
2. **Use S3 Intelligent Tiering** for cost optimization
3. **Monitor usage** with AWS Cost Explorer
4. **Set up billing alerts**

### 8. Troubleshooting

**Common Issues:**

1. **403 Forbidden Error**
   - Check bucket policy allows public read
   - Verify IAM user has correct permissions
   - Ensure bucket name is correct

2. **Access Denied**
   - Verify AWS credentials are correct
   - Check IAM policy permissions
   - Ensure region matches

3. **CORS Issues**
   - Add CORS configuration to S3 bucket if needed
   - Check frontend origin is allowed

**Debug Commands:**
```bash
# Test AWS credentials
aws s3 ls s3://your-bucket-name

# Upload test file
aws s3 cp test.jpg s3://your-bucket-name/test.jpg
```

### 9. Required AWS Keys Summary

Your application needs these 4 environment variables:

- `AWS_ACCESS_KEY_ID` - IAM user access key
- `AWS_SECRET_ACCESS_KEY` - IAM user secret key  
- `AWS_REGION` - S3 bucket region (e.g., us-east-1)
- `AWS_S3_BUCKET_NAME` - Your S3 bucket name

### 10. Next Steps

After configuration:
1. Test image upload functionality
2. Verify images are publicly accessible
3. Monitor AWS costs
4. Set up backup/disaster recovery if needed

---

**⚠️ Important Security Note:**
Never share your AWS credentials publicly or commit them to version control!
