const mongoose = require('mongoose');

const conflictPostSnapshotSchema = new mongoose.Schema({
  originalPostId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  platforms: {
    type: [String],
    default: []
  },
  authorName: {
    type: String,
    default: 'Coordinator'
  }
}, { _id: false });

const conflictAlertSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    index: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  posts: {
    type: [conflictPostSnapshotSchema],
    required: true
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: true });

conflictAlertSchema.index({ department: 1, scheduledFor: 1, resolved: 1 }, { unique: true });

module.exports = mongoose.model('ConflictAlert', conflictAlertSchema);
