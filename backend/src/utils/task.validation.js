const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().max(1000).allow(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  project: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  assignedTo: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  dueDate: Joi.date().iso().allow(null)
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150),
  description: Joi.string().trim().max(1000).allow(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  assignedTo: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  dueDate: Joi.date().iso().allow(null)
});

const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('todo', 'in-progress', 'done').required()
});

const queryTasksSchema = Joi.object({
  status: Joi.string().valid('todo', 'in-progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  assignedTo: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  project: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  search: Joi.string().trim().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

module.exports = { createTaskSchema, updateTaskSchema, updateTaskStatusSchema, queryTasksSchema };
