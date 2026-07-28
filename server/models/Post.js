const mongoose = require('mongoose');

const publishLogSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['Instagram', 'LinkedIn', 'Twitter'],
    required: true
  },
  status: {
    type: String,
    enum: ['Success', 'Failed'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  mockResponse: {
    type: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  platforms: {
    type: [String],
    enum: ['Instagram', 'LinkedIn', 'Twitter'],
    required: true
  },
  mediaUrl: {
    type: String,
    trim: true
  },
  templateRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  scheduledFor: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Scheduled', 'Published', 'Rejected'],
    default: 'Draft'
  },
  rejectionComment: {
    type: String,
    trim: true
  },
  authorRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishLogs: [publishLogSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
