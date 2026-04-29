const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, paginate } = require('../utils/apiResponse');

const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: parsedLimit } = paginate(page, limit);

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      User.countDocuments(query)
    ]);

    successResponse(res, 200, {
      users,
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

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(new AppError('User not found', 404));
    successResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return next(new AppError('You can only update your own profile', 403));
    }

    const allowedUpdates = ['name'];
    if (req.user.role === 'admin') allowedUpdates.push('role');

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) return next(new AppError('User not found', 404));
    successResponse(res, 200, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateUser };
