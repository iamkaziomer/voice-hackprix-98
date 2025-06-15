import mongoose from "mongoose";

const adminActionSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  actionType: {
    type: String,
    enum: [
      'status_change',
      'comment_added',
      'issue_deleted',
      'issue_flagged',
      'issue_assigned',
      'issue_escalated'
    ],
    required: true
  },
  oldStatus: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed", "flagged"]
  },
  newStatus: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed", "flagged"]
  },
  comment: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // For storing additional action-specific data
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
adminActionSchema.index({ admin: 1, createdAt: -1 });
adminActionSchema.index({ issue: 1, createdAt: -1 });
adminActionSchema.index({ actionType: 1, createdAt: -1 });

const AdminAction = mongoose.model('AdminAction', adminActionSchema);
export default AdminAction;
