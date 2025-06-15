import cloudflareR2 from './services/cloudflareR2.js';

async function testR2() {
  console.log('Testing R2 connection...');
  console.log('Bucket:', process.env.CLOUDFLARE_BUCKET);
  
  try {
    const result = await cloudflareR2.uploadImage({
      buffer: Buffer.from('test'),
      originalname: 'test.txt',
      mimetype: 'text/plain'
    });
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test error:', error);
  }
}

testR2();