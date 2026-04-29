/**
 * Dashboard Controller — returns task statistics and overview data
 */

const Task = require('../models/task.model');
const Project = require('../models/project.model');
const { successResponse } = require('../utils/apiResponse');

const getDashboardStats = async (req, res, next) => {
  try {
    const userProjects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);
    const baseQuery = { project: { $in: projectIds } };
    if (req.user.role === 'member') baseQuery.assignedTo = req.user._id;

    const [totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks, tasksByPriority, recentTasks] = await Promise.all([
      Task.countDocuments(baseQuery),
      Task.countDocuments({ ...baseQuery, status: 'done' }),
      Task.countDocuments({ ...baseQuery, status: 'in-progress' }),
      Task.countDocuments({ ...baseQuery, status: 'todo' }),
      Task.countDocuments({ ...baseQuery, isOverdue: true, status: { $ne: 'done' } }),
      Task.aggregate([{ $match: baseQuery }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.find(baseQuery).populate('assignedTo', 'name').populate('project', 'name').sort({ createdAt: -1 }).limit(5)
    ]);

    const totalProjects = await Project.countDocuments({ $or: [{ createdBy: req.user._id }, { members: req.user._id }] });
    const activeProjects = await Project.countDocuments({ $or: [{ createdBy: req.user._id }, { members: req.user._id }], status: 'active' });

    const priorityMap = {};
    tasksByPriority.forEach(p => { priorityMap[p._id] = p.count; });
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    successResponse(res, 200, {
      overview: { totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks, completionRate },
      projects: { total: totalProjects, active: activeProjects },
      byPriority: priorityMap,
      recentTasks
    });
  } catch (error) {
    next(error);
  }
};

const getProjectStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!project.isUserMember(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const baseQuery = { project: projectId };
    const [totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks, tasksByAssignee] = await Promise.all([
      Task.countDocuments(baseQuery),
      Task.countDocuments({ ...baseQuery, status: 'done' }),
      Task.countDocuments({ ...baseQuery, status: 'in-progress' }),
      Task.countDocuments({ ...baseQuery, status: 'todo' }),
      Task.countDocuments({ ...baseQuery, isOverdue: true, status: { $ne: 'done' } }),
      Task.aggregate([{ $match: baseQuery }, { $group: { _id: '$assignedTo', count: { $sum: 1 } } }, { $limit: 10 }])
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    successResponse(res, 200, { totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks, completionRate, tasksByAssignee });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getProjectStats };
