const mongoose = require('mongoose');

const engagementStatSchema = new mongoose.Schema({
  postRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  platform: {
    type: String,
    enum: ['Instagram', 'LinkedIn', 'Twitter'],
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EngagementStat', engagementStatSchema);
