const Project = require('../models/project.model');
const Task = require('../models/task.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const { successResponse, paginate } = require('../utils/apiResponse');
const { logActivity } = require('../utils/activityLogger');

const createProject = async (req, res, next) => {
  try {
    const { name, description, members, color } = req.body;

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return next(new AppError('Some member IDs are invalid', 400));
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [...members, req.user._id],
      color
    });

    await logActivity(req.user._id, 'create', 'project', project._id, `Project "${name}" created`);

    successResponse(res, 201, project, 'Project created successfully');
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: parsedLimit } = paginate(page, limit);

    const query = {
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('createdBy', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Project.countDocuments(query)
    ]);

    successResponse(res, 200, {
      projects,
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

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (!project.isUserMember(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('You do not have access to this project', 403));
    }

    successResponse(res, 200, project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Only project creator or admin can update this project', 403));
    }

    if (req.body.members) {
      const validMembers = await User.find({ _id: { $in: req.body.members } });
      if (validMembers.length !== req.body.members.length) {
        return next(new AppError('Some member IDs are invalid', 400));
      }
      req.body.members = [...new Set([...req.body.members, project.createdBy.toString()])];
    }

    const oldValues = { name: project.name, status: project.status };
    Object.assign(project, req.body);
    await project.save();

    await logActivity(req.user._id, 'update', 'project', project._id, `Project "${project.name}" updated`, {
      old: oldValues,
      new: { name: project.name, status: project.status }
    });

    successResponse(res, 200, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Only project creator or admin can delete this project', 403));
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    await logActivity(req.user._id, 'delete', 'project', project._id, `Project "${project.name}" deleted`);

    successResponse(res, 200, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return next(new AppError('Project not found', 404));
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Only project creator or admin can add members', 403));
    }

    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    if (project.members.includes(userId)) {
      return next(new AppError('User is already a member', 400));
    }

    project.members.push(userId);
    await project.save();

    await logActivity(req.user._id, 'add_member', 'project', project._id, `Added ${user.name} to project`);

    successResponse(res, 200, project, 'Member added successfully');
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Only project creator or admin can remove members', 403));
    }

    if (project.createdBy.toString() === req.params.userId) {
      return next(new AppError('Cannot remove project creator', 400));
    }

    const user = await User.findById(req.params.userId);
    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();

    await logActivity(req.user._id, 'remove_member', 'project', project._id, `Removed ${user?.name || 'user'} from project`);

    successResponse(res, 200, project, 'Member removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
