import express from 'express';
import User from '../models/user.js';
import Admin from '../models/admin.js';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import googleAuth from '../services/googleAuth.js';

const router = express.Router();

// Sign up route
router.post('/signup', async (req, res) => {
  try {
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    
    const { name, email, phone, password, address, landmark } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !address || !landmark) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      address,
      landmark
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    
    const { emailOrPhone, password } = req.body;

    // Validate required fields
    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone and password are required'
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get current user route
router.get('/me', auth, async (req, res) => {
  try {
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user data',
      error: error.message
    });
  }
});

// Update user route (optional)
router.put('/update', auth, async (req, res) => {
  try {
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    
    const updates = req.body;
    const allowedUpdates = ['name', 'address', 'landmark'];
    const updateKeys = Object.keys(updates);
    
    // Validate update fields
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid update fields'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    updateKeys.forEach(key => {
      user[key] = updates[key];
    });

    await user.save();

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        landmark: user.landmark
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user data',
      error: error.message
    });
  }
});

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');

    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify the Google ID token
    const verificationResult = await googleAuth.verifyIdToken(idToken);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const { user: googleUser } = verificationResult;

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.googleId }
      ]
    });

    if (user) {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.authProvider = 'google';
        user.emailVerified = googleUser.emailVerified;
        user.profilePicture = googleUser.picture;
        await user.save();
      }

      // Update last login
      await user.updateLastLogin();
    } else {
      // Create new user
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        authProvider: 'google',
        emailVerified: googleUser.emailVerified,
        profilePicture: googleUser.picture,
        // These fields will be filled later if needed
        phone: null,
        address: null,
        landmark: null
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during Google authentication',
      error: error.message
    });
  }
});

// Admin login route
router.post('/admin/login', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Check password
    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate token with admin role
    const token = jwt.sign(
      {
        userId: admin._id,
        role: 'admin',
        adminRole: admin.role,
        region: admin.region
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        region: admin.region,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin login',
      error: error.message
    });
  }
});

export default router;