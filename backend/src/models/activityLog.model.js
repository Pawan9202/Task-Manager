const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['project', 'task', 'user'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: String
  },
  changes: {
    type: Object,
    default: null
  }
}, {
  timestamps: true
});

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
