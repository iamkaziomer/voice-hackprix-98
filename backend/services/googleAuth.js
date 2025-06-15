import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

class GoogleAuthService {
  constructor() {
    // Validate required environment variables
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
      console.error('GOOGLE_CLIENT_ID is not properly configured');
    }
    if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET === 'your-google-client-secret') {
      console.error('GOOGLE_CLIENT_SECRET is not properly configured');
    }

    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173'
    );
  }

  async verifyIdToken(idToken) {
    try {
      // Validate input
      if (!idToken) {
        throw new Error('ID token is required');
      }

      // Check if Google client is properly configured
      if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
        throw new Error('Google OAuth is not properly configured');
      }

      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      // Validate payload
      if (!payload || !payload.sub || !payload.email) {
        throw new Error('Invalid token payload');
      }

      return {
        success: true,
        user: {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name || payload.given_name + ' ' + payload.family_name,
          picture: payload.picture,
          emailVerified: payload.email_verified || false
        }
      };
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify Google token'
      };
    }
  }

  async getAuthUrl() {
    try {
      const authUrl = this.client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        include_granted_scopes: true
      });

      return {
        success: true,
        authUrl
      };
    } catch (error) {
      console.error('Error generating auth URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTokens(code) {
    try {
      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);

      return {
        success: true,
        tokens
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new GoogleAuthService();
