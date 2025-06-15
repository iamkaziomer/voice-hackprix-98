// models/issue.js
import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: "open",
    enum: ["open", "in-progress", "resolved", "closed"]
  },
  priority: { 
    type: String, 
    required: true,
    enum: ["low", "medium", "high"]
  },
  concernAuthority: { 
    type: String, 
    required: true 
  },
  reporter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  comments: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    text: String,
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  images: { 
    type: [String], 
    default: [] 
  },
  tags: { 
    type: [String], 
    default: [] 
  },
  colony: { 
    type: String, 
    required: true 
  },
  pincode: { 
    type: String, 
    required: true 
  },
  location: {
    type: { 
      type: String, 
      enum: ["Point"], 
      default: "Point" 
    },
    coordinates: { 
      type: [Number], 
      required: true 
    }
  },
  upvotes: {
    count: { 
      type: Number, 
      default: 0,
      min: 0
    },
    users: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }]
  },
  target: { 
    type: Number, 
    default: 100,
    min: 1 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // This automatically handles createdAt and updatedAt
});

// Add 2dsphere index for geospatial queries
issueSchema.index({ location: "2dsphere" });

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;