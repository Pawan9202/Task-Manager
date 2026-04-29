const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

projectSchema.index({ createdBy: 1 });
projectSchema.index({ members: 1 });

projectSchema.methods.isUserMember = function(userId) {
  return this.members.some(memberId => memberId.toString() === userId.toString()) ||
         this.createdBy.toString() === userId.toString();
};

module.exports = mongoose.model('Project', projectSchema);
