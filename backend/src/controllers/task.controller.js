const Task = require('../models/task.model');
const Project = require('../models/project.model');
const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, paginate } = require('../utils/apiResponse');
const { logActivity } = require('../utils/activityLogger');

const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, project, assignedTo, dueDate } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return next(new AppError('Project not found', 404));

    if (!projectDoc.isUserMember(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('You do not have access to this project', 403));
    }

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) return next(new AppError('Assigned user not found', 404));

    if (!projectDoc.members.includes(assignedTo) && projectDoc.createdBy.toString() !== assignedTo) {
      return next(new AppError('Assigned user must be a project member', 400));
    }

    const task = await Task.create({
      title,
      description,
      priority,
      project,
      assignedTo,
      createdBy: req.user._id,
      dueDate
    });

    await logActivity(req.user._id, 'create', 'task', task._id, `Task "${title}" created`);

    successResponse(res, 201, task, 'Task created successfully');
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { page, limit, status, priority, assignedTo, search } = req.query;
    const { skip, limit: parsedLimit } = paginate(page, limit);

    const query = {};

    if (req.params.projectId) {
      const project = await Project.findById(req.params.projectId);
      if (!project) return next(new AppError('Project not found', 404));
      if (!project.isUserMember(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('Access denied', 403));
      }
      query.project = req.params.projectId;
    } else {
      const userProjects = await Project.find({
        $or: [{ createdBy: req.user._id }, { members: req.user._id }]
      }).select('_id');
      query.project = { $in: userProjects.map(p => p._id) };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (req.user.role === 'member' && !assignedTo) {
      query.assignedTo = req.user._id;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Task.countDocuments(query)
    ]);

    successResponse(res, 200, {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) return next(new AppError('Task not found', 404));

    const project = await Project.findById(task.project._id || task.project);
    if (!project.isUserMember(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    successResponse(res, 200, task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new AppError('Task not found', 404));

    const project = await Project.findById(task.project);
    if (!project.isUserMember(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    if (req.user.role === 'member' && task.assignedTo.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update tasks assigned to you', 403));
    }

    if (req.body.assignedTo) {
      if (req.user.role !== 'admin') {
        return next(new AppError('Only admins can reassign tasks', 403));
      }
      const user = await User.findById(req.body.assignedTo);
      if (!user) return next(new AppError('User not found', 404));
      if (!project.members.includes(req.body.assignedTo) && project.createdBy.toString() !== req.body.assignedTo) {
        return next(new AppError('Assigned user must be a project member', 400));
      }
    }

    const oldValues = { title: task.title, priority: task.priority, dueDate: task.dueDate };
    Object.assign(task, req.body);
    await task.save();

    await logActivity(req.user._id, 'update', 'task', task._id, `Task "${task.title}" updated`, {
      old: oldValues,
      new: { title: task.title, priority: task.priority, dueDate: task.dueDate }
    });

    successResponse(res, 200, task, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new AppError('Task not found', 404));

    const project = await Project.findById(task.project);
    if (!project.isUserMember(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    if (req.user.role === 'member' && task.assignedTo.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update status of tasks assigned to you', 403));
    }

    const { status } = req.body;
    if (!Task.isValidTransition(task.status, status)) {
      return next(new AppError(
        `Invalid status transition from "${task.status}" to "${status}". Valid transitions: ${Task.isValidTransition.__proto__}`,
        400
      ));
    }

    const oldStatus = task.status;
    task.status = status;
    task.checkOverdue();
    await task.save();

    await logActivity(req.user._id, 'status_change', 'task', task._id,
      `Task "${task.title}" status changed from "${oldStatus}" to "${status}"`);

    successResponse(res, 200, task, 'Task status updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new AppError('Task not found', 404));

    const project = await Project.findById(task.project);
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Only project creator or admin can delete tasks', 403));
    }

    const taskTitle = task.title;
    await task.deleteOne();

    await logActivity(req.user._id, 'delete', 'task', task._id, `Task "${taskTitle}" deleted`);

    successResponse(res, 200, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
