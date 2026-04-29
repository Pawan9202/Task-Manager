const ActivityLog = require('../models/activityLog.model');

const logActivity = async (userId, action, entityType, entityId, details = null, changes = null) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      entityType,
      entityId,
      details,
      changes
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = { logActivity };
