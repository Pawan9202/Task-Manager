/**
 * Task Model
 * 
 * Enforces strict status transitions to maintain workflow integrity:
 * todo → in-progress → done (with allowed reversals)
 */

const mongoose = require('mongoose');

const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_TRANSITIONS = {
  'todo': ['in-progress'],
  'in-progress': ['todo', 'done'],
  'done': ['in-progress']
};

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: VALID_STATUSES,
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to a user']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  isOverdue: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

// Static method — validates allowed status transitions
taskSchema.statics.isValidTransition = function(from, to) {
  return VALID_TRANSITIONS[from] && VALID_TRANSITIONS[from].includes(to);
};

// Auto-detect overdue status based on due date
taskSchema.methods.checkOverdue = function() {
  if (this.dueDate && this.status !== 'done') {
    this.isOverdue = new Date() > new Date(this.dueDate);
  } else {
    this.isOverdue = false;
  }
  return this.isOverdue;
};

// Check overdue before every save
taskSchema.pre('save', function(next) {
  this.checkOverdue();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
