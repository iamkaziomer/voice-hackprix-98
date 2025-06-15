// models/user.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: function() {
      return !this.googleId; // Phone required only if not Google OAuth user
    },
    sparse: true // Allow multiple null values
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google OAuth user
    }
  },
  address: {
    type: String,
    required: function() {
      return !this.googleId; // Address required only if not Google OAuth user
    }
  },
  landmark: {
    type: String,
    required: function() {
      return !this.googleId; // Landmark required only if not Google OAuth user
    }
  },
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  profilePicture: {
    type: String // URL to profile picture
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  upvotedIssues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Update last login method
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);
export default User;