const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('admin', 'member').default('member')
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required()
});

module.exports = { signupSchema, loginSchema };
