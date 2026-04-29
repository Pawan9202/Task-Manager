const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { logActivity } = require('../utils/activityLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const isFirstUser = (await User.countDocuments()) === 0;
    const userRole = isFirstUser ? 'admin' : role;

    const user = await User.create({ name, email, password, role: userRole });
    const token = generateToken(user._id);

    await logActivity(user._id, 'signup', 'user', user._id, `User ${user.name} registered as ${userRole}`);

    successResponse(res, 201, {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    }, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken(user._id);

    await logActivity(user._id, 'login', 'user', user._id, `User ${user.name} logged in`);

    successResponse(res, 200, {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    successResponse(res, 200, {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getProfile };
