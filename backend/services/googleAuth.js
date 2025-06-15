import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173'
    );
  }

  async verifyIdToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      return {
        success: true,
        user: {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          emailVerified: payload.email_verified
        }
      };
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      return {
        success: false,
        error: error.message
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
